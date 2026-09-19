import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { createSedanBlueprint } from './blueprint'
import { createCarMaterials, type CarMaterials } from './materials'

export interface CarModel { group: THREE.Group; materials: CarMaterials }

const createRoundedBox = (size: [number, number, number], material: THREE.Material, radius = 0.08, segments = 5, name = '') => {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius), material)
  mesh.name = name
  return mesh
}

const createLine = (name: string, points: THREE.Vector3[], color = '#18202a', opacity = 0.68) => {
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material)
  line.name = name
  return line
}

const createSideShape = (name: string, points: Array<[number, number]>, material: THREE.Material, zSide: number) => {
  const shape = new THREE.Shape()
  const [firstPoint, ...rest] = points
  shape.moveTo(firstPoint[0], firstPoint[1])
  rest.forEach(([x, y]) => shape.lineTo(x, y))
  shape.closePath()

  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material)
  mesh.name = name
  mesh.position.z = zSide
  mesh.rotation.y = zSide < 0 ? Math.PI : 0
  return mesh
}

const sideName = (zSide: number) => zSide < 0 ? 'left' : 'right'

const createWheel = (materials: CarMaterials, name: string) => {
  const wheel = new THREE.Group()
  wheel.name = name
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.24, 56, 1), materials.tire)
  tire.name = 'low-profile-tire'
  tire.rotation.x = Math.PI / 2
  tire.scale.y = 0.78
  tire.castShadow = true
  wheel.add(tire)

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 14, 56), materials.rim)
  rim.name = 'dark-rim-ring'
  rim.castShadow = true
  wheel.add(rim)

  for (let index = 0; index < 12; index += 1) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.022, 0.024), materials.rim)
    spoke.name = `dark-multi-spoke-rim-${index + 1}`
    spoke.rotation.z = (index / 12) * Math.PI
    spoke.castShadow = true
    wheel.add(spoke)
  }

  return wheel
}

const addSideDetails = (group: THREE.Group, materials: CarMaterials, zSide: number) => {
  const side = sideName(zSide)
  const shoulderZ = zSide + Math.sign(zSide) * 0.018
  const trimZ = zSide + Math.sign(zSide) * 0.036
  const doorLineZ = zSide + Math.sign(zSide) * 0.045

  group.add(createLine(`${side}-shoulder-character-line`, [new THREE.Vector3(2.72, 1.08, shoulderZ), new THREE.Vector3(0.6, 1.15, shoulderZ), new THREE.Vector3(-2.78, 1.05, shoulderZ)], '#293342', 0.86))
  group.add(createLine(`${side}-lower-door-crease`, [new THREE.Vector3(2.15, 0.68, shoulderZ), new THREE.Vector3(-2.36, 0.66, shoulderZ)], '#151b23', 0.7))

  const trim = createSideShape(`${side}-side-glass-trim`, [[0.7, 1.24], [0.36, 1.72], [-0.95, 1.76], [-1.68, 1.58], [-2.02, 1.25], [-1.56, 1.25], [-1.35, 1.43], [0.52, 1.4]], materials.darkChrome, trimZ)
  group.add(trim)
  const glass = createSideShape(`${side}-side-glass`, [[0.58, 1.28], [0.28, 1.64], [-0.86, 1.66], [-1.52, 1.5], [-1.78, 1.29], [-1.5, 1.29], [-1.28, 1.42], [0.45, 1.38]], materials.glass, trimZ + Math.sign(zSide) * 0.006)
  group.add(glass)
  const kink = createSideShape(`${side}-hofmeister-kink`, [[-1.78, 1.29], [-1.52, 1.5], [-1.35, 1.43], [-1.5, 1.29]], materials.darkChrome, trimZ + Math.sign(zSide) * 0.012)
  group.add(kink)

  ;[
    ['front-door-cut', 0.45],
    ['rear-door-cut', -0.78],
    ['rear-quarter-cut', -1.62],
  ].forEach(([suffix, x]) => {
    group.add(createLine(`${side}-${suffix}`, [new THREE.Vector3(Number(x), 0.62, doorLineZ), new THREE.Vector3(Number(x) - 0.05, 1.21, doorLineZ)], '#0d1118', 0.74))
  })

  ;[
    [1.04, 'front'],
    [-0.18, 'rear'],
  ].forEach(([x, door]) => {
    const handle = createRoundedBox([0.28, 0.028, 0.035], materials.darkChrome, 0.014, 3, `${side}-${door}-door-handle`)
    handle.position.set(Number(x), 1.02, doorLineZ)
    group.add(handle)
  })
}

export function createCar(): CarModel {
  const blueprint = createSedanBlueprint()
  const materials = createCarMaterials()
  const group = new THREE.Group()
  group.name = 'procedural-obsidian-g30-inspired-sedan'

  const body = createRoundedBox([blueprint.length, 0.64, blueprint.width], materials.paint, 0.2, 9, 'long-wheelbase-body')
  body.position.y = 0.76
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  const lowerSill = createRoundedBox([blueprint.length - 0.52, 0.16, blueprint.width * 0.94], materials.paint, 0.11, 5, 'subtle-lower-sill')
  lowerSill.position.set(-0.08, 0.47, 0)
  lowerSill.castShadow = true
  group.add(lowerSill)

  const hood = createRoundedBox([blueprint.hoodLength + 0.36, 0.3, blueprint.width * 0.86], materials.paint, 0.14, 7, 'long-hood')
  hood.position.set(2.06, 1.06, 0)
  hood.rotation.z = -0.033
  hood.castShadow = true
  group.add(hood)

  const trunk = createRoundedBox([1.16, 0.32, blueprint.width * 0.9], materials.paint, 0.12, 6, 'short-rear-deck')
  trunk.position.set(-2.44, 1.02, 0)
  trunk.rotation.z = 0.022
  trunk.castShadow = true
  group.add(trunk)

  const cabin = createRoundedBox([blueprint.cabinLength, 0.72, blueprint.width * 0.66], materials.glass, 0.15, 8, 'rear-set-smoked-cabin')
  cabin.position.set(blueprint.cabinCenterX, 1.43, 0)
  cabin.scale.set(1, 0.88, 1)
  cabin.castShadow = true
  group.add(cabin)

  const roof = createRoundedBox([1.66, 0.16, blueprint.width * 0.56], materials.paint, 0.11, 6, 'low-painted-roof')
  roof.position.set(blueprint.cabinCenterX - 0.08, 1.86, 0)
  roof.castShadow = true
  group.add(roof)

  const frontGlass = createRoundedBox([0.08, 0.58, blueprint.width * 0.57], materials.glass, 0.04, 4, 'raked-front-windshield')
  frontGlass.position.set(0.66, 1.43, 0)
  frontGlass.rotation.z = -0.45
  group.add(frontGlass)

  const rearGlass = createRoundedBox([0.08, 0.5, blueprint.width * 0.53], materials.glass, 0.04, 4, 'raked-rear-window')
  rearGlass.position.set(-1.78, 1.39, 0)
  rearGlass.rotation.z = 0.48
  group.add(rearGlass)

  const frontX = blueprint.length / 2 + 0.035
  const rearX = -blueprint.length / 2 - 0.03
  ;([
    [-0.17, 'left-kidney-aperture'],
    [0.17, 'right-kidney-aperture'],
  ] as const).forEach(([z, name]) => {
    const aperture = createRoundedBox([0.075, 0.55, 0.25], materials.darkChrome, 0.075, 8, name)
    aperture.position.set(frontX, 0.9, z)
    aperture.scale.set(1, 1.18, 0.82)
    group.add(aperture)

    const inset = createRoundedBox([0.08, 0.44, 0.15], materials.tire, 0.045, 5, `${name}-shadow`)
    inset.position.set(frontX + 0.005, 0.9, z)
    inset.scale.set(1, 1.05, 0.72)
    group.add(inset)
  })

  ;[
    [-0.69, 'left'],
    [0.69, 'right'],
  ].forEach(([z, side]) => {
    const headlight = createRoundedBox([0.07, 0.08, 0.62], materials.light, 0.035, 5, `${side}-wraparound-headlight`)
    headlight.position.set(frontX + 0.02, 0.98, Number(z))
    headlight.rotation.y = Number(z) < 0 ? -0.08 : 0.08
    group.add(headlight)

    const fenderWrap = createRoundedBox([0.34, 0.055, 0.045], materials.light, 0.025, 4, `${side}-headlight-fender-wrap`)
    fenderWrap.position.set(frontX - 0.15, 0.97, Number(z) + Math.sign(Number(z)) * 0.28)
    fenderWrap.rotation.y = Number(z) < 0 ? -0.55 : 0.55
    group.add(fenderWrap)

    const tailHorizontal = createRoundedBox([0.055, 0.082, 0.55], materials.tailLight, 0.035, 5, `${side}-tail-l-horizontal`)
    tailHorizontal.position.set(rearX, 0.98, Number(z))
    group.add(tailHorizontal)

    const tailVertical = createRoundedBox([0.055, 0.25, 0.08], materials.tailLight, 0.03, 4, `${side}-tail-l-vertical`)
    tailVertical.position.set(rearX + 0.004, 0.88, Number(z) + Math.sign(Number(z)) * 0.28)
    group.add(tailVertical)
  })

  const zOffset = blueprint.width / 2 + 0.018
  ;[-zOffset, zOffset].forEach((zSide) => addSideDetails(group, materials, zSide))

  ;([
    [blueprint.wheelbase / 2, 0.48, -0.99, 'front-left-wheel'],
    [blueprint.wheelbase / 2, 0.48, 0.99, 'front-right-wheel'],
    [-blueprint.wheelbase / 2, 0.48, -0.99, 'rear-left-wheel'],
    [-blueprint.wheelbase / 2, 0.48, 0.99, 'rear-right-wheel'],
  ] as const).forEach(([x, y, z, name]) => {
    const wheel = createWheel(materials, name)
    wheel.position.set(x, y, z)
    if (z < 0) wheel.rotation.y = Math.PI
    group.add(wheel)

    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.025, 8, 42, Math.PI), materials.darkChrome)
    arch.name = `${name}-filled-arch-trim`
    arch.position.set(x, y + 0.05, z + Math.sign(z) * 0.012)
    arch.rotation.z = Math.PI
    arch.rotation.y = z < 0 ? Math.PI : 0
    group.add(arch)
  })

  const shadowPlate = createRoundedBox([5.95, 0.03, 1.72], materials.darkChrome, 0.04, 4, 'dark-ground-reflection-plate')
  shadowPlate.position.set(0, 0.32, 0)
  shadowPlate.scale.set(1, 1, 0.98)
  group.add(shadowPlate)
  group.scale.setScalar(0.86)
  return { group, materials }
}
