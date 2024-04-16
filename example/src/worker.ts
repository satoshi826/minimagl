import {Loop, Renderer, ResizeArgs, calcAspectRatioVec, setHandler, setState} from '../../src'
import {Core} from '../../src/Core'
import {getGpgpu} from './gpgpu'
import {getProgram} from './program'

console.log('starting worker')

onmessage = async({data}) => {
  const {init, mouse, resize} = data

  if (init) {
    const core = new Core({canvas: init, resizeListener: (fn) => setHandler('resize', fn)})
    const renderer = new Renderer(core, {backgroundColor: [0, 0, 0, 1]})

    const gpgpu = getGpgpu(core)
    const program = getProgram(core, gpgpu)

    setHandler('resize', ({width, height}: ResizeArgs = {}) => {
      const ar = width && height ? calcAspectRatioVec(width, height) : [1, 1]
      program.set({u_aspectRatio: ar})
    })

    setHandler('mouse', (v) => {
      if (v) {
        const {x, y} = v as { x: number, y: number}
        gpgpu.set({u_origin: [x, y]})
      }
    })

    const animation = new Loop({callback: ({delta, unix}) => {
      renderer.clear()
      gpgpu.set({u_delta: delta, u_unix: unix})
      gpgpu.run()
      renderer.render(gpgpu.vao, program)
    }, interval: 0})

    animation.start()

    setInterval(() => self.postMessage({
      drawTime: animation.drawTime.toFixed(2) + ' ms',
      fps     : (1000 / animation.delta).toFixed(2)
    }), 200)

  }

  if (mouse) setState({mouse})
  if (resize) setState({resize})
}

export default {}
