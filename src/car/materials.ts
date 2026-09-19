import * as THREE from 'three'

export interface CarMaterials {
  paint: THREE.MeshPhysicalMaterial
  darkChrome: THREE.MeshPhysicalMaterial
  glass: THREE.MeshPhysicalMaterial
  tire: THREE.MeshStandardMaterial
  rim: THREE.MeshStandardMaterial
  light: THREE.MeshStandardMaterial
  tailLight: THREE.MeshStandardMaterial
}

export function createCarMaterials(): CarMaterials {
  return {
    paint: new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#050507'), metalness: 0.92, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12, reflectivity: 0.82 }),
    darkChrome: new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#111318'), metalness: 1, roughness: 0.18, clearcoat: 0.8 }),
    glass: new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#05080c'), metalness: 0.08, roughness: 0.05, transmission: 0.2, transparent: true, opacity: 0.58, clearcoat: 1, clearcoatRoughness: 0.04 }),
    tire: new THREE.MeshStandardMaterial({ color: new THREE.Color('#050505'), metalness: 0.12, roughness: 0.72 }),
    rim: new THREE.MeshStandardMaterial({ color: new THREE.Color('#20242c'), metalness: 0.9, roughness: 0.24 }),
    light: new THREE.MeshStandardMaterial({ color: new THREE.Color('#dbeaff'), emissive: new THREE.Color('#9fc5ff'), emissiveIntensity: 1.55, roughness: 0.18 }),
    tailLight: new THREE.MeshStandardMaterial({ color: new THREE.Color('#300408'), emissive: new THREE.Color('#ff1830'), emissiveIntensity: 1.4, roughness: 0.25 }),
  }
}
