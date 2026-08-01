
export function fs_lines() {
  return `#version 300 es
precision highp float;

in vec4 v_col;
out vec4 outColor;

void main() {
  outColor = v_col;
}
`;
}
