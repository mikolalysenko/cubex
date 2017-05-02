const regl = require('regl')({
  extensions: [
    'OES_texture_float',
    'OES_texture_float_linear'
  ]
})
const renderToCubeMap = require('./render-to-cube')(regl)
const renderCubeMap = require('./render-cube')(regl)
const camera = require('./camera')(regl)

const cubeFBO = regl.framebufferCube({
  shape: [256, 256, 4],
  depthStencil: false
})

const renderCubeFace = regl({
  frag: `
  precision highp float;
  varying vec3 direction;
  void main () {
    vec3 d = normalize(direction);
    gl_FragColor = vec4(0.5 * (1. + d), 1.);
  }
  `
})

renderToCubeMap(cubeFBO, () => {
  renderCubeFace()
})

const state = {
  cube: 1,
  sphere: 0,
  cylinder: 0,
  targetCube: 1,
  targetSphere: 0,
  targetCylinder: 0,
  interpRate: 0.1,
  theta: 0,
  phi: 0,
  radius: 5
}

require('control-panel')([
  {
    type: 'select',
    label: 'target',
    options: [
      'cube',
      'sphere',
      'cylinder'
    ]
  }
]).on('input', (data) => {
  if (data.target) {
    switch (data.target) {
      case 'cube':
        state.targetCube = 1
        state.targetSphere = state.targetCylinder = 0
        state.interpRate = 0.1
        break
      case 'sphere':
        state.targetSphere = 1
        state.targetCube = state.targetCylinder = 0
        state.interpRate = 0.1
        break
      case 'cylinder':
        state.targetCylinder = 1
        state.targetSphere = state.targetCube = 0
        state.interpRate = 0.001
        break
    }
  }
})

var lastX = 0
var lastY = 0

window.addEventListener('mousemove', ({clientX, clientY, buttons}) => {
  const x = clientX / window.innerWidth
  const y = 1 - clientY / window.innerHeight
  if (buttons) {
    state.theta += 6 * (x - lastX)
    state.phi += 2 * (lastY - y)
    state.phi = Math.max(Math.min(state.phi, Math.PI / 2), -Math.PI / 2)
  }
  lastX = x
  lastY = y
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  camera(state, () => {
    renderCubeMap(Object.assign({
      cubemap: cubeFBO
    }, state))
  })

  const r = state.interpRate
  const ri = 1 - r
  state.cube = ri * state.cube + r * state.targetCube
  state.sphere = ri * state.sphere + r * state.targetSphere
  state.cylinder = ri * state.cylinder + r * state.targetCylinder
})
