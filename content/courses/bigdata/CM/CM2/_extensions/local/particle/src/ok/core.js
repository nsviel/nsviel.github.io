// particle.js — WebGL2 particles (motion in vertex shader) + lines fading with distance
// Uses TWO programs (points + lines) to avoid u_mode link issues.
//
// Expected files:
//   ./utils/struct.js  (exports `engine` with cfg + typed arrays placeholders)
//   ./gl/vertex_points.js      exports vs_points()
//   ./gl/fragment_points.js    exports fs_points()
//   ./gl/vertex_lines.js       exports vs_lines()
//   ./gl/fragment_lines.js     exports fs_lines()
//
// HTML:
//   <canvas id="webgl"></canvas>
//   <script type="module" src="./particle.js"></script>

import { engine } from "./struct.js";
import { vs_points } from "./shader/vertex_points.js";
import { fs_points } from "./shader/fragment_points.js";
import { vs_lines } from "./shader/vertex_lines.js";
import { fs_lines } from "./shader/fragment_lines.js";



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

function init_context() {
  const canvas = document.querySelector("#webgl");
  if (!canvas) throw new Error("Canvas #webgl introuvable");

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    depth: false,
    premultipliedAlpha: false,
  });
  if (!gl) throw new Error("WebGL2 indisponible");

  // IMPORTANT: do NOT call gl.enable(gl.PROGRAM_POINT_SIZE) (invalid cap in WebGL)
  gl.disable(gl.DEPTH_TEST);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  engine.canvas = canvas;
  engine.gl = gl;
}

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
  };

  // ---- Lines program
  const progLines = linkProgram(gl, vs_lines(), fs_lines());
  gl.useProgram(progLines);

  const locLines = {
    program: progLines,
    a_pos: gl.getAttribLocation(progLines, "a_pos"),
    a_col: gl.getAttribLocation(progLines, "a_col"),
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

function init_points(n) {
  // Base positions in clip space [-1, 1]
  const basePos = new Float32Array(n * 2);
  const vel = new Float32Array(n * 2);
  const col = new Float32Array(n * 4);

  for (let i = 0; i < n; i++) {
    const ip = i * 2;
    const ic = i * 4;

    const b = engine.cfg.bound;
    basePos[ip] = rand(-b, b);
    basePos[ip + 1] = rand(-b, b);

    vel[ip] = rand(-1, 1) * engine.cfg.speed;
    vel[ip + 1] = rand(-1, 1) * engine.cfg.speed;

    // point color
    col[ic] = 0.95;
    col[ic + 1] = 0.98;
    col[ic + 2] = 1.0;
    col[ic + 3] = 0.95;
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

function init_line_cpu_buffers() {
  const maxVerts = engine.cfg.maxSegments * 2; // 2 vertices per segment
  engine.data.linePos = new Float32Array(maxVerts * 2); // x,y
  engine.data.lineCol = new Float32Array(maxVerts * 4); // r,g,b,a
  engine.data.lineVertCount = 0;

  // Allocate max size on GPU once
  const gl = engine.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.linePos);
  gl.bufferData(gl.ARRAY_BUFFER, engine.data.linePos.byteLength, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.lineCol);
  gl.bufferData(gl.ARRAY_BUFFER, engine.data.lineCol.byteLength, gl.DYNAMIC_DRAW);
}

// Build lines on CPU based on *current* positions p(t) = wrap(base + vel*t)
function rebuild_lines_cpu(t) {
  const n = engine.cfg.n;
  const maxDist = engine.cfg.maxDist;
  const maxDist2 = maxDist * maxDist;

  const basePos = engine.data.basePos;
  const vel = engine.data.vel;

  // compute positions at time t (same wrap logic as vertex shader)
  const px = new Float32Array(n);
  const py = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const k = i * 2;
    let x = basePos[k] + vel[k] * t;
    let y = basePos[k + 1] + vel[k + 1] * t;

    const b = engine.cfg.bound;
    x = wrapBound(x, b);
    y = wrapBound(y, b);

    px[i] = x;
    py[i] = y;
  }

  const outPos = engine.data.linePos;
  const outCol = engine.data.lineCol;

  let vCount = 0;
  let segCount = 0;

  for (let i = 0; i < n && segCount < engine.cfg.maxSegments; i++) {
    const xi = px[i], yi = py[i];

    for (let j = i + 1; j < n && segCount < engine.cfg.maxSegments; j++) {
      const dx = xi - px[j];
      const dy = yi - py[j];
      const d2 = dx * dx + dy * dy;

      if (d2 <= maxDist2) {
        const d = Math.sqrt(d2);
        const d0 = maxDist * 0.5;   // début du fade
        const d1 = maxDist;          // fin du fade

        // alpha = 1 à d<=d0, alpha -> 0 en allant vers d1
        let a = smoothstep(d1, d0, d);   // attention: ordre inversé
          a = Math.pow(a, 0.6)

        const pOff = vCount * 2;
        const cOff = vCount * 4;

        // v0
        outPos[pOff] = xi;
        outPos[pOff + 1] = yi;
        outCol[cOff] = 0.9;
        outCol[cOff + 1] = 0.95;
        outCol[cOff + 2] = 1.0;
        outCol[cOff + 3] = a;

        // v1
        outPos[pOff + 2] = px[j];
        outPos[pOff + 3] = py[j];
        outCol[cOff + 4] = 0.9;
        outCol[cOff + 5] = 0.95;
        outCol[cOff + 6] = 1.0;
        outCol[cOff + 7] = a;

        vCount += 2;
        segCount += 1;
      }
    }
  }

  engine.data.lineVertCount = vCount;

  // Upload only used range
  const gl = engine.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.linePos);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, outPos.subarray(0, vCount * 2));

  gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.lineCol);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, outCol.subarray(0, vCount * 4));
}

function draw(t) {
  const gl = engine.gl;

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
      gl.vertexAttribPointer(L.a_pos, 2, gl.FLOAT, false, 0, 0);
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
    const P = engine.programs.points;
    gl.useProgram(P.program);

    // uniforms 
    if (P.u_bound) gl.uniform1f(P.u_bound, engine.cfg.bound);
    if (P.u_time) gl.uniform1f(P.u_time, t);
    if (P.u_pointSize) gl.uniform1f(P.u_pointSize, engine.cfg.pointSize);

    // a_basePos
    if (P.a_basePos >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.basePos);
      gl.enableVertexAttribArray(P.a_basePos);
      gl.vertexAttribPointer(P.a_basePos, 2, gl.FLOAT, false, 0, 0);
    }

    // a_vel
    if (P.a_vel >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.vel);
      gl.enableVertexAttribArray(P.a_vel);
      gl.vertexAttribPointer(P.a_vel, 2, gl.FLOAT, false, 0, 0);
    }

    // a_col
    if (P.a_col >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers.col);
      gl.enableVertexAttribArray(P.a_col);
      gl.vertexAttribPointer(P.a_col, 4, gl.FLOAT, false, 0, 0);
    }

    gl.drawArrays(gl.POINTS, 0, engine.cfg.n);
  }
}

function resize() {
  const canvas = engine.canvas;
  const gl = engine.gl;

  const dpr = window.devicePixelRatio || 1;
  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
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
