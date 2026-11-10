export function vs_lines() {
  return `#version 300 es
precision highp float;

in vec3 a_pos;
in vec4 a_col;

uniform mat4 u_proj;

out vec4 v_col;

void main() {
  gl_Position = u_proj * vec4(a_pos, 1.0);
  v_col = a_col;
}
`;
}
