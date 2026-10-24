export function shader_fragment(){
  //-----------------------

  // Fragment shader program
  const shader =
  `#version 300 es

  precision highp float;
  uniform bool is_point;
  in vec4 frag_color;
  out vec4 out_color;

  void main() {
    //-----------------------

    if(is_point){
      float r = 0.0, delta = 0.0, alpha = 1.0;
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      r = dot(cxy, cxy);
      if (r > 1.0) {
        discard;
      }
    }

    //-----------------------
    out_color = frag_color;
  }
  `;

  //-----------------------
  return shader;
}
