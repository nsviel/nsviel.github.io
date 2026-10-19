
export function vs_points() {
  return `#version 300 es
precision highp float;

in vec2 a_basePos;
in vec2 a_vel;
in vec4 a_col;

uniform float u_time;
uniform float u_pointSize;
uniform float u_bound;

out vec4 v_col;


vec2 wrap(vec2 p) {
  // wrap dans [-u_bound, u_bound]
  float w = 2.0 * u_bound;
  return mod(p + u_bound, w) - u_bound;
}

void main() {
  vec2 p = wrap(a_basePos + a_vel * u_time);
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = u_pointSize;
  v_col = a_col;
}
`;
}
