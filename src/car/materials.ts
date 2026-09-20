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
    paint: new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#030304'), metalness: 0.94, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.16, reflectivity: 0.9, envMapIntensity: 1.45 }),
    darkChrome: new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#090b0f'), metalness: 1, roughness: 0.16, clearcoat: 0.9, clearcoatRoughness: 0.1, envMapIntensity: 1.25, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#03070b'), metalness: 0.06, roughness: 0.04, transmission: 0.16, transparent: true, opacity: 0.46, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.15, side: THREE.DoubleSide }),
    tire: new THREE.MeshStandardMaterial({ color: new THREE.Color('#030303'), metalness: 0.08, roughness: 0.78 }),
    rim: new THREE.MeshStandardMaterial({ color: new THREE.Color('#171b22'), metalness: 0.92, roughness: 0.22, envMapIntensity: 1.1 }),
    light: new THREE.MeshStandardMaterial({ color: new THREE.Color('#b5c8de'), emissive: new THREE.Color('#7fa6d8'), emissiveIntensity: 0.28, roughness: 0.18 }),
    tailLight: new THREE.MeshStandardMaterial({ color: new THREE.Color('#300408'), emissive: new THREE.Color('#ff1830'), emissiveIntensity: 0.48, roughness: 0.25 }),
  }
}
