import { engine } from "./struct.js";
import { vs_points } from "./shader/vertex_points.js";
import { fs_points } from "./shader/fragment_points.js";
import { vs_lines } from "./shader/vertex_lines.js";
import { fs_lines } from "./shader/fragment_lines.js";


//----------------------------
export function main() {
  init_context();
  init_programs();
  init_buffers();
  init_points(engine.cfg.n);
  init_line_cpu_buffers();

  resize();
  window.addEventListener("resize", resize);

  const t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / 1000;

    rebuild_lines_cpu(t);
    draw(t);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

//----------------------------
function init_context() {
  const canvas = document.querySelector("#webgl");
  if (!canvas) throw new Error("Canvas #webgl introuvable");

const gl = canvas.getContext("webgl2", {
  alpha: true,
  antialias: (engine.cfg.ssaa || 1) <= 1, // ✅ MSAA seulement si SSAA off
  depth: false,
  premultipliedAlpha: false,
});
  if (!gl) throw new Error("WebGL2 indisponible");

  // IMPORTANT: do NOT call gl.enable(gl.PROGRAM_POINT_SIZE) (invalid cap in WebGL)
  gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  engine.canvas = canvas;
  engine.gl = gl;
}

//----------------------------
function init_programs() {
  const gl = engine.gl;

  // ---- Points program
  const progPoints = linkProgram(gl, vs_points(), fs_points());
  gl.useProgram(progPoints);

    const locPoints = {
      program: progPoints,
      a_basePos: gl.getAttribLocation(progPoints, "a_basePos"),
      a_vel: gl.getAttribLocation(progPoints, "a_vel"),
      a_col: gl.getAttribLocation(progPoints, "a_col"),
      u_time: gl.getUniformLocation(progPoints, "u_time"),
      u_pointSize: gl.getUniformLocation(progPoints, "u_pointSize"),
      u_bound: gl.getUniformLocation(progPoints, "u_bound"),
      u_proj: gl.getUniformLocation(progPoints, "u_proj"),   // ✅
    };

  // ---- Lines program
  const progLines = linkProgram(gl, vs_lines(), fs_lines());
  gl.useProgram(progLines);

  const locLines = {
  program: progLines,
  a_pos: gl.getAttribLocation(progLines, "a_pos"),
  a_col: gl.getAttribLocation(progLines, "a_col"),
  u_proj: gl.getUniformLocation(progLines, "u_proj")
  };

  // Sanity checks (will help if nothing renders)
  if (locPoints.a_basePos < 0 || locPoints.a_vel < 0 || locPoints.a_col < 0) {
    console.warn("Points attrib location -1 (shader may have optimized them out).", locPoints);
  }
  if (locLines.a_pos < 0 || locLines.a_col < 0) {
    console.warn("Lines attrib location -1 (shader may have optimized them out).", locLines);
  }

  engine.programs = { points: locPoints, lines: locLines };
}

//----------------------------
function init_buffers() {
  const gl = engine.gl;

  engine.buffers = {
    basePos: gl.createBuffer(),
    vel: gl.createBuffer(),
    col: gl.createBuffer(),

    linePos: gl.createBuffer(),
    lineCol: gl.createBuffer(),
  };
}

//----------------------------
function init_points(n) {
  // Base positions in clip space [-1, 1]
  const basePos = new Float32Array(n * 3);
  const vel = new Float32Array(n * 3);
  const col = new Float32Array(n * 4);

  for (let i = 0; i < n; i++) {
    const ip = i * 3;
    const ic = i * 4;

    const b = engine.cfg.bound;

    basePos[ip]     = rand(-b, b);
    basePos[ip + 1] = rand(-b, b);
// bias > 1 => plus loin ; bias < 1 => plus proche
const bias = engine.cfg.depthBias ?? 2.5;

const u = Math.random();          // 0..1
const t = 1 - Math.pow(u, bias);  // t proche de 1 plus souvent -> loin
basePos[ip + 2] = (-engine.cfg.depthRange) + t * (-b + engine.cfg.depthRange);

    vel[ip]     = rand(-1, 1) * engine.cfg.speed;
    vel[ip + 1] = rand(-1, 1) * engine.cfg.speed;
    vel[ip + 2] = rand(-1, 1) * engine.cfg.speed * 0.05; 


    // point color
    col[ic] = 0.95;
    col[ic + 1] = 0.98;
    col[ic + 2] = 1.0;
    col[ic + 3] = engine.cfg.pointAlpha;
  }

  engine.data = engine.data || {};
  engine.data.basePos = basePos;
  engine.data.vel = vel;
  engine.data.col = col;

  // Upload once
  const gl = engine.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.basePos);
  gl.bufferData(gl.ARRAY_BUFFER, basePos, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.vel);
  gl.bufferData(gl.ARRAY_BUFFER, vel, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.col);
  gl.bufferData(gl.ARRAY_BUFFER, col, gl.STATIC_DRAW);
}

//----------------------------
function init_line_cpu_buffers() {
  const maxVerts = engine.cfg.maxSegments * 2; // 2 vertices per segment
  engine.data.linePos = new Float32Array(maxVerts * 3); // x,y
  engine.data.lineCol = new Float32Array(maxVerts * 4); // r,g,b,a
  engine.data.lineVertCount = 0;

  // Allocate max size on GPU once
  const gl = engine.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.linePos);
  gl.bufferData(gl.ARRAY_BUFFER, engine.data.linePos.byteLength, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.lineCol);
  gl.bufferData(gl.ARRAY_BUFFER, engine.data.lineCol.byteLength, gl.DYNAMIC_DRAW);
}

//----------------------------
function rebuild_lines_cpu(t) {
  const n = engine.cfg.n;
  const maxDist = engine.cfg.maxDist;
  const maxDist2 = maxDist * maxDist;
  const b = engine.cfg.bound;

  const basePos = engine.data.basePos; // Float32Array (n*3)
  const vel = engine.data.vel;         // Float32Array (n*3)

  // positions à l’instant t (wrap identique au shader)
  const px = new Float32Array(n);
  const py = new Float32Array(n);
  const pz = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const k = i * 3;

    let x = basePos[k]     + vel[k]     * t;
    let y = basePos[k + 1] + vel[k + 1] * t;
    let z = basePos[k + 2] + vel[k + 2] * t;

    x = wrapBound(x, b);
    y = wrapBound(y, b);
    z = clamp(z, -b, -0.2);

    px[i] = x;
    py[i] = y;
    pz[i] = z;
  }

  const outPos = engine.data.linePos; // Float32Array (maxVerts*2)
  const outCol = engine.data.lineCol; // Float32Array (maxVerts*4)

  let vCount = 0;
  let segCount = 0;

  // fade zone: commence près du seuil pour garder les lignes opaques quand proches
  const d0 = maxDist * 0.9; // début du fade (opaque en dessous)
  const d1 = maxDist;      // fin du fade (0 au-dessus)

  for (let i = 0; i < n && segCount < engine.cfg.maxSegments; i++) {
    const xi = px[i], yi = py[i], zi = pz[i];

    for (let j = i + 1; j < n && segCount < engine.cfg.maxSegments; j++) {
      const xj = px[j], yj = py[j], zj = pz[j];

      const dx = xi - xj;
      const dy = yi - yj;
      const dz = zi - zj;
      const d2 = dx * dx + dy * dy + dz * dz;
    //const d2 = dx*dx + dy*dy;

      if (d2 <= maxDist2) {


const d = Math.sqrt(d2);

// fade distance strict
let a = 1.0 - smoothstep(d0, d1, d); // 1 proche, 0 à d1
a = clamp(a, 0.0, 1.0);

// sécurité absolue
if (d >= maxDist) a = 0.0;

const zMid = 0.5 * (zi + zj);

const zFront = -0.2;
const zBack  = -b;

let cam = (zMid - zBack) / (zFront - zBack);
cam = clamp(cam, 0.0, 1.0);
cam = Math.pow(cam, 1.8);

const gain   = engine.cfg.lineAlpha ?? 1.5;
const camMin = engine.cfg.lineDepthMin ?? 0.4;
const camMix = camMin + (1.0 - camMin) * cam;

// alpha final
const alpha = clamp(a * camMix * gain, 0.0, 1.0);


        const pOff = vCount * 3;
        const cOff = vCount * 4;

        // v0 (x,y)
        outPos[pOff + 0] = xi;
        outPos[pOff + 1] = yi;
        outPos[pOff + 2] = zi;

        outCol[cOff] = 0.9;
        outCol[cOff + 1] = 0.95;
        outCol[cOff + 2] = 1.0;
        outCol[cOff + 3] = alpha;

        // v1 (x,y)
        outPos[pOff + 3] = xj;
        outPos[pOff + 4] = yj;
        outPos[pOff + 5] = zj;

        outCol[cOff + 4] = 0.9;
        outCol[cOff + 5] = 0.95;
        outCol[cOff + 6] = 1.0;
        outCol[cOff + 7] = alpha;

        vCount += 2;
        segCount += 1;
      }
    }
  }

  engine.data.lineVertCount = vCount;

  // Upload only used range
  const gl = engine.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.linePos);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, outPos.subarray(0, vCount * 3));

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.lineCol);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, outCol.subarray(0, vCount * 4));
}
//----------------------------
function draw(t) {
  const gl = engine.gl;
    const s = engine.cfg.ssaa || 1;

    if (s > 1 && engine.fbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, engine.fbo.fbo);
      gl.viewport(0, 0, engine.fbo.w, engine.fbo.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // ---- Draw LINES (programLines)
  {
    const L = engine.programs.lines;
    gl.useProgram(L.program);

    // position (a_pos)
    if (L.a_pos >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.linePos);
      gl.enableVertexAttribArray(L.a_pos);
      gl.vertexAttribPointer(L.a_pos, 3, gl.FLOAT, false, 0, 0);
    }

    // color (a_col)
    if (L.a_col >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.lineCol);
      gl.enableVertexAttribArray(L.a_col);
      gl.vertexAttribPointer(L.a_col, 4, gl.FLOAT, false, 0, 0);
    }

    gl.drawArrays(gl.LINES, 0, engine.data.lineVertCount);
  }

  // ---- Draw POINTS (programPoints)
  {
      const P = engine.programs.points;   // ✅ défini ici
      gl.useProgram(P.program);

      if (P.u_bound) gl.uniform1f(P.u_bound, engine.cfg.bound);
      if (P.u_time) gl.uniform1f(P.u_time, t);
      if (P.u_pointSize) gl.uniform1f(P.u_pointSize, engine.cfg.pointSize);
      if (P.u_proj && engine.proj) gl.uniformMatrix4fv(P.u_proj, false, engine.proj);



    // a_basePos
    if (P.a_basePos >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.basePos);
      gl.enableVertexAttribArray(P.a_basePos);
      gl.vertexAttribPointer(P.a_basePos, 3, gl.FLOAT, false, 0, 0);
    }

    // a_vel
    if (P.a_vel >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.vel);
      gl.enableVertexAttribArray(P.a_vel);
      gl.vertexAttribPointer(P.a_vel, 3, gl.FLOAT, false, 0, 0);
    }

    // a_col
    if (P.a_col >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.col);
      gl.enableVertexAttribArray(P.a_col);
      gl.vertexAttribPointer(P.a_col, 4, gl.FLOAT, false, 0, 0);
    }

    gl.drawArrays(gl.POINTS, 0, engine.cfg.n);
  }

    if (s > 1 && engine.fbo) {
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, engine.fbo.fbo);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  gl.blitFramebuffer(
    0, 0, engine.fbo.w, engine.fbo.h,
    0, 0, gl.canvas.width, gl.canvas.height,
    gl.COLOR_BUFFER_BIT,
    gl.LINEAR
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
}

//----------------------------
function resize() {
  const canvas = engine.canvas;
  const gl = engine.gl;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  // viewport écran (utile si ssaa=1)
  gl.viewport(0, 0, w, h);

  // ✅ create/resize FBO APRES avoir mis canvas.width/height
  ensureFBO();

  engine.proj = createProjection();

  // push proj to both programs
  const L = engine.programs.lines;
  if (L?.u_proj) {
    gl.useProgram(L.program);
    gl.uniformMatrix4fv(L.u_proj, false, engine.proj);
  }
  const P = engine.programs.points;
  if (P?.u_proj) {
    gl.useProgram(P.program);
    gl.uniformMatrix4fv(P.u_proj, false, engine.proj);
  }
}


//----------------------------
function createProjection() {
  const gl = engine.gl;
  const aspect = gl.canvas.width / gl.canvas.height;
  const fov = Math.PI / 3;
  const near = 0.1;
  const far = 10.0;

  const f = 1.0 / Math.tan(fov / 2);
  const nf = 1 / (near - far);

  return new Float32Array([
    f/aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far+near)*nf, -1,
    0, 0, (2*far*near)*nf, 0
  ]);
}

// ---- Shader helpers
function linkProgram(gl, vsSource, fsSource) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const msg = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link failed: " + msg);
  }
  return program;
}

function compile(gl, type, src) {
    src = src.trimStart();
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const msg = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("Shader compile failed: " + msg);
  }
  return sh;
}

// ---- Math helpers
function rand(a, b) {
  return a + Math.random() * (b - a);
}

// wrap to [-1, 1] (matches shader mod wrap)
function wrapBound(x, b) {
  const w = 2 * b;
  x = (x + b) % w;
  if (x < 0) x += w;
  return x - b;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}


function ensureFBO() {
  const gl = engine.gl;
  const s = engine.cfg.ssaa || 1;

  // taille cible (canvas déjà à jour dans resize())
  const w = gl.canvas.width * s;
  const h = gl.canvas.height * s;

  if (s <= 1) {
    // pas de FBO si ssaa off
    if (engine.fbo) {
      gl.deleteTexture(engine.fbo.tex);
      gl.deleteFramebuffer(engine.fbo.fbo);
      engine.fbo = null;
    }
    return;
  }

  if (engine.fbo && engine.fbo.w === w && engine.fbo.h === h) return;

  // cleanup
  if (engine.fbo) {
    gl.deleteTexture(engine.fbo.tex);
    gl.deleteFramebuffer(engine.fbo.fbo);
  }

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    console.warn("FBO incomplete:", status);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  engine.fbo = { fbo, tex, w, h };
}

// main function
main();
