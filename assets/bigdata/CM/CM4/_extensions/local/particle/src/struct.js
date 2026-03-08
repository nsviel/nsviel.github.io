
export const engine = {
  canvas: null,
  gl: null,
  program: null,

  attrib: {
    a_basePos: -1,
    a_vel: -1,
    a_col: -1,
  },

  uniform: {
    u_time: null,
    u_pointSize: null,
    u_mode: null, // 0 = points (advect), 1 = lines (no advect)
  },

  buffers: {
    basePos: null,
    vel: null,
    col: null,

    linePos: null,
    lineCol: null,
  },

  data: {
    basePos: null, // Float32Array (n*2)
    vel: null,     // Float32Array (n*2)
    col: null,     // Float32Array (n*4)

    // buffers CPU temporaires pour les lignes
    linePos: null, // Float32Array (maxSeg*2 endpoints => maxVerts*2)
    lineCol: null, // Float32Array (maxVerts*4)
    lineVertCount: 0,
  },

  cfg: {
    ssaa: 1,

    n: 350,
    speed: 0.02,
    pointSize: 10,
    pointAlpha: 0.8,

    bound: 1.25,
    depthRange: 0.2,   // distance max utilisée pour le scaling
    maxDist: 0.375,        // distance en clip space [-1,1]
    maxSegments: 3000,    // limite segments (perf)
  }
};
