import * as THREE from 'three'

export interface ParticleField {
  points: THREE.Points
  update: (elapsed: number) => void
}

export function createParticleField(count = 900): ParticleField {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  for (let index = 0; index < count; index += 1) {
    const radius = 5 + Math.random() * 13
    const angle = Math.random() * Math.PI * 2
    positions[index * 3] = Math.cos(angle) * radius
    positions[index * 3 + 1] = 0.6 + Math.random() * 5.6
    positions[index * 3 + 2] = Math.sin(angle) * radius - 2
    sizes[index] = 0.35 + Math.random() * 0.85
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  const material = new THREE.PointsMaterial({ color: '#9fb6d0', size: 0.018, sizeAttenuation: true, transparent: true, opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending })
  const points = new THREE.Points(geometry, material)
  points.name = 'studio-light-motes'
  return { points, update: (elapsed) => { points.rotation.y = elapsed * 0.012; points.position.y = Math.sin(elapsed * 0.2) * 0.05 } }
}
