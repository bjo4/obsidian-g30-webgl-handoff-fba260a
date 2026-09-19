export interface ScrollState {
  progress: number
  pointerX: number
  pointerY: number
  aspect: number
}

export interface ScrollController {
  state: ScrollState
  dispose: () => void
}

const getScrollProgress = () => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  return Math.min(1, Math.max(0, window.scrollY / maxScroll))
}

export function createScrollController(): ScrollController {
  const state: ScrollState = { progress: getScrollProgress(), pointerX: 0, pointerY: 0, aspect: window.innerWidth / Math.max(1, window.innerHeight) }
  const onScroll = () => { state.progress = getScrollProgress() }
  const onPointerMove = (event: PointerEvent) => { state.pointerX = (event.clientX / window.innerWidth) * 2 - 1; state.pointerY = (event.clientY / window.innerHeight) * 2 - 1 }
  const onResize = () => { state.aspect = window.innerWidth / Math.max(1, window.innerHeight); state.progress = getScrollProgress() }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('resize', onResize)
  return { state, dispose: () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('resize', onResize) } }
}
