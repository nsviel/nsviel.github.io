export function vs_points() {
  return `#version 300 es
precision highp float;

in vec3 a_basePos;
in vec3 a_vel;
in vec4 a_col;

uniform float u_time;
uniform float u_pointSize;
uniform float u_bound;
uniform mat4 u_proj;

out vec4 v_col;

vec2 wrap2(vec2 p) {
  float w = 2.0 * u_bound;
  return mod(p + u_bound, w) - u_bound;
}

float saturate(float x){ return clamp(x, 0.0, 1.0); }

void main() {
  vec3 p = a_basePos + a_vel * u_time;

  // wrap uniquement x,y
  p.xy = wrap2(p.xy);

  // clamp z (doit matcher ton JS: [-u_bound, -0.2])
  p.z = clamp(p.z, -u_bound, -0.2);

  gl_Position = u_proj * vec4(p, 1.0);

  // -------- depth -> point size
  // z=-0.2 => depth=1 (proche), z=-u_bound => depth=0 (loin)
  float depth = (p.z - (-u_bound)) / (-0.2 - (-u_bound));
  depth = saturate(depth);

  // courbe pour garder "petit loin" et booster proche
  float scale = 0.4 + 1.6 * pow(depth, 0.7);

  gl_PointSize = u_pointSize * scale;

  // optionnel: alpha aussi dépend de la profondeur
  v_col = vec4(a_col.rgb, a_col.a);
}
`;
}
