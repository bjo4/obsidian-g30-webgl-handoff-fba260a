export interface CameraFrameInput {
  progress: number
  pointerX: number
  pointerY: number
  aspect: number
}

export interface CameraFrame {
  progress: number
  position: { x: number; y: number; z: number }
  target: { x: number; y: number; z: number }
  carRotationY: number
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const mix = (from: number, to: number, alpha: number) => from + (to - from) * alpha
const easeInOutCubic = (value: number) => value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2

export function computeCameraFrame(input: CameraFrameInput): CameraFrame {
  const progress = clamp01(input.progress)
  const eased = easeInOutCubic(progress)
  const orbitAngle = mix(0.72, Math.PI + 0.22, eased)
  const radius = mix(8.4, 7.05, progress)
  const safeAspect = Math.min(1.8, Math.max(0.75, input.aspect))
  const parallaxX = input.pointerX * 0.34 * safeAspect
  const parallaxY = input.pointerY * 0.18

  return {
    progress,
    position: { x: Math.sin(orbitAngle) * radius + parallaxX, y: mix(1.95, 2.35, Math.sin(progress * Math.PI)) + parallaxY, z: Math.cos(orbitAngle) * radius },
    target: { x: mix(0.25, -0.1, progress) + input.pointerX * 0.06, y: 0.82 + input.pointerY * 0.04, z: mix(0.05, -0.12, progress) },
    carRotationY: mix(-0.16, 0.24, progress) + input.pointerX * 0.045,
  }
}
