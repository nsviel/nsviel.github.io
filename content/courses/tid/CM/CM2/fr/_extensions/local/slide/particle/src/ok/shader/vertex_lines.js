
export function vs_lines() {
  return `#version 300 es
precision highp float;

in vec2 a_pos;
in vec4 a_col;

out vec4 v_col;

void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
  v_col = a_col;
}
`;
}
