import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { createSedanBlueprint } from './blueprint'
import { createCarMaterials, type CarMaterials } from './materials'

export interface CarModel { group: THREE.Group; materials: CarMaterials }

const createRoundedBox = (size: [number, number, number], material: THREE.Material, radius = 0.08, segments = 5) => new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius), material)

const addSideLines = (group: THREE.Group, zSide: number) => {
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#1e2630', transparent: true, opacity: 0.65 })
  ;[-1.85, -0.85, 0.18, 1.1].forEach((x) => group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0.58, zSide), new THREE.Vector3(x + 0.03, 1.13, zSide)]), lineMaterial)))
}

const createWheel = (materials: CarMaterials) => {
  const wheel = new THREE.Group()
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.34, 42, 1), materials.tire)
  tire.rotation.x = Math.PI / 2
  tire.castShadow = true
  wheel.add(tire)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 12, 40), materials.rim)
  rim.castShadow = true
  wheel.add(rim)
  for (let index = 0; index < 8; index += 1) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.025, 0.025), materials.rim)
    spoke.rotation.z = (index / 8) * Math.PI
    spoke.castShadow = true
    wheel.add(spoke)
  }
  return wheel
}

const addQuarterWindowKink = (group: THREE.Group, materials: CarMaterials, zSide: number, flip = false) => {
  const shape = new THREE.Shape()
  shape.moveTo(-0.14, -0.18); shape.lineTo(0.2, 0.16); shape.lineTo(0.2, -0.18); shape.lineTo(-0.14, -0.18)
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), materials.darkChrome)
  mesh.position.set(-1.64, 1.38, zSide)
  mesh.rotation.y = flip ? Math.PI : 0
  mesh.scale.setScalar(0.82)
  group.add(mesh)
}

export function createCar(): CarModel {
  const blueprint = createSedanBlueprint()
  const materials = createCarMaterials()
  const group = new THREE.Group()
  group.name = 'procedural-obsidian-g30-inspired-sedan'

  const body = createRoundedBox([blueprint.length, 0.72, blueprint.width], materials.paint, 0.18, 8); body.position.y = 0.78; body.castShadow = true; body.receiveShadow = true; group.add(body)
  const hood = createRoundedBox([blueprint.hoodLength + 0.28, 0.34, blueprint.width * 0.9], materials.paint, 0.13, 6); hood.position.set(1.78, 1.08, 0); hood.rotation.z = -0.035; hood.castShadow = true; group.add(hood)
  const trunk = createRoundedBox([1.28, 0.35, blueprint.width * 0.92], materials.paint, 0.12, 6); trunk.position.set(-2.18, 1.05, 0); trunk.rotation.z = 0.025; trunk.castShadow = true; group.add(trunk)
  const cabin = createRoundedBox([blueprint.cabinLength, 0.82, blueprint.width * 0.68], materials.glass, 0.16, 8); cabin.position.set(-0.48, 1.46, 0); cabin.scale.set(1, 0.92, 1); cabin.castShadow = true; group.add(cabin)
  const roof = createRoundedBox([1.72, 0.18, blueprint.width * 0.58], materials.paint, 0.12, 6); roof.position.set(-0.64, 1.93, 0); roof.castShadow = true; group.add(roof)
  const frontGlass = createRoundedBox([0.08, 0.58, blueprint.width * 0.58], materials.glass, 0.04, 4); frontGlass.position.set(0.72, 1.48, 0); frontGlass.rotation.z = -0.42; group.add(frontGlass)
  const rearGlass = createRoundedBox([0.08, 0.52, blueprint.width * 0.54], materials.glass, 0.04, 4); rearGlass.position.set(-1.72, 1.43, 0); rearGlass.rotation.z = 0.46; group.add(rearGlass)

  const frontX = blueprint.length / 2 + 0.04
  const grilleLeft = createRoundedBox([0.06, 0.42, 0.23], materials.darkChrome, 0.055, 5); grilleLeft.position.set(frontX, 0.88, -0.15)
  const grilleRight = grilleLeft.clone(); grilleRight.position.z = 0.15; group.add(grilleLeft, grilleRight)

  ;[-0.66, 0.66].forEach((z) => { const headlight = createRoundedBox([0.06, 0.09, 0.47], materials.light, 0.035, 4); headlight.position.set(frontX + 0.02, 0.96, z); group.add(headlight); const tail = createRoundedBox([0.05, 0.12, 0.42], materials.tailLight, 0.035, 4); tail.position.set(-blueprint.length / 2 - 0.025, 0.9, z); group.add(tail) })
  const zOffset = blueprint.width / 2 + 0.025
  ;[-zOffset, zOffset].forEach((zSide) => { addSideLines(group, zSide); const sideWindow = createRoundedBox([1.78, 0.34, 0.035], materials.glass, 0.045, 4); sideWindow.position.set(-0.42, 1.46, zSide); group.add(sideWindow); blueprint.doors.forEach((doorX) => { const handle = createRoundedBox([0.26, 0.035, 0.04], materials.darkChrome, 0.018, 3); handle.position.set(doorX, 1.05, zSide); group.add(handle) }); addQuarterWindowKink(group, materials, zSide + Math.sign(zSide) * 0.01, zSide < 0) })
  ;([[1.92, 0.44, -0.98], [1.92, 0.44, 0.98], [-2.05, 0.44, -0.98], [-2.05, 0.44, 0.98]] as const).forEach(([x, y, z]) => { const wheel = createWheel(materials); wheel.position.set(x, y, z); if (z < 0) wheel.rotation.y = Math.PI; group.add(wheel) })
  const shadowPlate = createRoundedBox([5.7, 0.03, 1.7], materials.darkChrome, 0.04, 4); shadowPlate.position.set(0, 0.34, 0); shadowPlate.scale.set(1, 1, 0.98); group.add(shadowPlate)
  group.scale.setScalar(0.86)
  return { group, materials }
}
