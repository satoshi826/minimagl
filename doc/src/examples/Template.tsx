import {Fab, Icon} from '@mui/material'
import {useCanvas} from './useCanvas'
import {useEffect} from 'react'
import {resizeObserver, screenToViewPort} from 'glaku'

export function Template({src, state, sendMouse = true}: {src: string, state?: object, sendMouse?: boolean}) {
  const {canvas, post, ref} = useCanvas()

  useEffect(() => {
    post({src})
    if (state) post({state})
  }, [])

  const sendResize = resizeObserver(({width, height}) => post({state: {resize: {width, height}}}))

  const handleMouseMove = ({offsetX, offsetY, target}: MouseEvent) => {
    const {clientWidth, clientHeight} = target as HTMLElement
    const {x, y} = screenToViewPort({offsetX, offsetY, clientWidth, clientHeight})
    post({state: {mouse: {x, y}}})
  }

  useEffect(() => {
    if (ref.current) {
      sendResize.observe(ref.current)
      if (sendMouse) ref.current.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      if (ref.current) {
        sendResize.unobserve(ref.current)
        if (sendMouse) ref.current.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [ref])


  return (
    <>
      {canvas}
      <Fab sx={{position: 'absolute', right: 16, bottom: 16}}
        LinkComponent={'a'}
        href={`https://github.com/satoshi826/glaku/blob/main/doc/src/examples/${src}/main.ts`}
        target="_blank"
      >
        <Icon >
            code
        </Icon>
      </Fab>
    </>
  )
}