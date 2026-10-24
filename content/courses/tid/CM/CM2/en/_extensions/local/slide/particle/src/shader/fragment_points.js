
export function fs_points() {
  return `#version 300 es
precision highp float;

in vec4 v_col;
out vec4 outColor;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  float a = smoothstep(1.0, 0.2, d);
  outColor = vec4(v_col.rgb, v_col.a * a);
}
`;
}
