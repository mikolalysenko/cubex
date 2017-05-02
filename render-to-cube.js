const mat4 = require('gl-mat4')

module.exports = function (regl) {
  const ORIGIN = [0, 0, 0]

  const CUBEMAP_SIDES = [
    { target: [-1, 0, 0], up: [0, -1, 0] },
    { target: [1, 0, 0], up: [0, -1, 0] },
    { target: [0, 1, 0], up: [0, 0, 1] },
    { target: [0, -1, 0], up: [0, 0, -1] },
    { target: [0, 0, 1], up: [0, -1, 0] },
    { target: [0, 0, -1], up: [0, -1, 0] }
  ]

  const setupCubeFace = regl({
    framebuffer: function (context, props, batchId) {
      return this.cubeFBO.faces[batchId]
    },

    vert: `
    precision highp float;
    varying vec3 direction;
    attribute vec2 position;
    uniform mat4 projection, view;
    void main () {
      vec4 phg = view * vec4(position, 1, 1);
      direction = vec3(phg.xy, -phg.z) / phg.w;
      gl_Position = vec4(position, 0, 1);
    }
    `,

    attributes: {
      position: [
        -4, 0,
        4, 4,
        4, -4
      ]
    },

    context: {
      projection: regl.this('projection'),
      view: function (_, {target, up}) {
        return mat4.lookAt(this.view, ORIGIN, target, up)
      },
      eye: regl.this('center')
    },

    uniforms: {
      projection: regl.this('projection'),
      view: regl.context('view'),
      eye: regl.this('center')
    },

    count: 3,
    primitive: 'triangles',
    elements: null,
    offset: 0
  })

  const cubeProps = {
    projection: new Float32Array(16),
    view: new Float32Array(16),
    cubeFBO: null
  }

  function setupCube (fbo, block) {
    cubeProps.cubeFBO = fbo
    mat4.perspective(
      cubeProps.projection,
      Math.PI / 2.0,
      1.0,
      0.25,
      1000.0)
    setupCubeFace.call(cubeProps, CUBEMAP_SIDES, block)
  }

  return setupCube
}
