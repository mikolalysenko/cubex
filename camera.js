const mat4 = require('gl-mat4')

module.exports = function (regl) {
  const projection = new Float32Array(16)
  const view = new Float32Array(16)

  const ORIGIN = [0, 0, 0]
  const UP = [0, 1, 0]

  return regl({
    context: {
      projection: ({viewportWidth, viewportHeight}) =>
        mat4.perspective(projection,
          Math.PI / 4,
          viewportWidth / viewportHeight,
          0.1,
          10000),
      view: (context, { theta, phi, radius }) =>
        mat4.lookAt(
          view,
          [
            radius * Math.cos(theta) * Math.cos(phi),
            radius * Math.sin(phi),
            radius * Math.sin(theta) * Math.cos(phi)
          ],
          ORIGIN,
          UP)
    },

    uniforms: {
      projection: regl.context('projection'),
      view: regl.context('view')
    }
  })
}
