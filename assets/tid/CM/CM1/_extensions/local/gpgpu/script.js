/*
 * Adapted from a shader playground by Matthias Hurrle (@atzedent)
 * https://codepen.io/atzedent/pen/yyajWpJ
 * MIT License
 */

const canvas = document.getElementById("canvas");
const shaderSource = document.getElementById("fragShader").textContent.trim();

class Renderer {
  #vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main() {
  gl_Position = position;
}`;

  #vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas, scale = window.devicePixelRatio || 1) {
    this.canvas = canvas;
    this.scale = Math.max(1, scale);
    this.gl = canvas.getContext("webgl2", { antialias: true });
    this.program = null;
    this.buffer = null;
    this.startTime = performance.now();

    if (!this.gl) {
      throw new Error("WebGL2 not supported");
    }
  }

  resize() {
    const width = Math.floor(window.innerWidth * this.scale);
    const height = Math.floor(window.innerHeight * this.scale);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  compile(shader, source) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Shader compile error");
    }
  }

  setup(fragmentSource) {
    const gl = this.gl;

    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);

    this.compile(vs, this.#vertexSrc);
    this.compile(fs, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program link error");
    }

    this.program = program;
    this.program.resolution = gl.getUniformLocation(program, "resolution");
    this.program.time = gl.getUniformLocation(program, "time");

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#vertices), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  }

  render(now) {
    const gl = this.gl;
    const time = (now - this.startTime) * 1e-3;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.uniform2f(this.program.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.program.time, time);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

let renderer;

function animate(now) {
  renderer.render(now);
  requestAnimationFrame(animate);
}

function init() {
  try {
    renderer = new Renderer(canvas, 1);
    renderer.setup(shaderSource);
    renderer.resize();
    requestAnimationFrame(animate);

    window.addEventListener("resize", () => {
      renderer.resize();
    });
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `<pre style="color:#fff;background:#000;padding:1rem;margin:0;">${error.message}</pre>`;
  }
}

window.addEventListener("load", init);
