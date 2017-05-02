const CUBE_RES = 128

module.exports = function (regl) {
  const positions = []

  const SQUARE_VERTS = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
  ]

  for (var d = 0; d < 3; ++d) {
    for (var s = -1; s <= 1; s += 2) {
      var u = (d + 1) % 3
      var v = (d + 2) % 3
      for (var nx = 0; nx <= CUBE_RES; ++nx) {
        for (var ny = 0; ny <= CUBE_RES; ++ny) {
          for (var i = 0; i < SQUARE_VERTS.length; ++i) {
            const x = [0, 0, 0]
            x[d] = s
            x[u] = (s * SQUARE_VERTS[i][0] + 2 * nx) / CUBE_RES - 1
            x[v] = (SQUARE_VERTS[i][1] + 2 * ny) / CUBE_RES - 1
            positions.push(x)
          }
        }
      }
    }
  }

  return regl({
    frag: `
    precision highp float;
    varying vec3 direction;
    uniform samplerCube cubemap;
    void main () {
      gl_FragColor = textureCube(cubemap, direction);
    }
    `,

    vert: `
    precision highp float;
    varying vec3 direction;
    attribute vec3 position;
    uniform mat4 projection, view;
    uniform float cubeWeight, sphereWeight, cylinderWeight;
    void main () {
      float totalWeight = cubeWeight + sphereWeight + cylinderWeight;

      vec3 cubePos = position;
      vec3 spherePos = normalize(position);
      vec3 cylinderPos = -spherePos * 500.0;

      direction = spherePos;

      gl_Position = projection * view * vec4(
        (cubeWeight * cubePos +
        sphereWeight * spherePos +
        cylinderWeight * cylinderPos) / totalWeight,
        1);
    }
    `,

    attributes: {
      position: positions
    },

    uniforms: {
      cubeWeight: regl.prop('cube'),
      sphereWeight: regl.prop('sphere'),
      cylinderWeight: regl.prop('cylinder'),
      cubemap: regl.prop('cubemap')
    },

    count: positions.length,
    offset: 0,
    elements: null,
    primitive: 'triangles'
  })
}
