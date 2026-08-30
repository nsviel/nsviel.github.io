
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
    n: 200,
    speed: 0.05,
    pointSize: 10,

    bound: 1.25,
    maxDist: 0.3,        // distance en clip space [-1,1]
    maxSegments: 2200,    // limite segments (perf)
  }
};
