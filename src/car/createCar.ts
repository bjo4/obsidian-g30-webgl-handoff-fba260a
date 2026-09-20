import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { createSedanBlueprint, type SedanBlueprint } from './blueprint'
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

interface BodyStation {
  x: number
  bottomY: number
  beltY: number
  crownY: number
  halfWidth: number
}

const createShellStations = (blueprint: SedanBlueprint): BodyStation[] => {
  const halfLength = blueprint.length / 2
  const maxHalfWidth = blueprint.width / 2
  const rearHalfWidth = maxHalfWidth * (1 - blueprint.rearTrackTaper * 1.75)
  const roofPeakY = blueprint.height + 0.18

  return [
    { x: -halfLength, bottomY: 0.42, beltY: 0.72, crownY: 0.72, halfWidth: rearHalfWidth },
    { x: -halfLength + blueprint.rearDeckLength * 0.22, bottomY: 0.4, beltY: 0.8, crownY: 0.88, halfWidth: rearHalfWidth + 0.06 },
    { x: -halfLength + blueprint.rearDeckLength * 0.42, bottomY: 0.39, beltY: 0.86, crownY: 0.94, halfWidth: rearHalfWidth + 0.1 },
    { x: -halfLength + blueprint.rearDeckLength * 0.72, bottomY: 0.39, beltY: 0.92, crownY: 1.06, halfWidth: rearHalfWidth + 0.16 },
    { x: -halfLength + blueprint.rearDeckLength * 1.09, bottomY: 0.39, beltY: 0.99, crownY: 1.25, halfWidth: maxHalfWidth * 0.9 },
    { x: blueprint.cabinCenterX - blueprint.cabinLength * 0.28, bottomY: 0.41, beltY: 1.06, crownY: 1.42, halfWidth: maxHalfWidth * 0.97 },
    { x: blueprint.roofPeakX, bottomY: 0.42, beltY: 1.1, crownY: roofPeakY, halfWidth: maxHalfWidth },
    { x: halfLength - blueprint.hoodLength * 1.29, bottomY: 0.4, beltY: 1.08, crownY: 1.25, halfWidth: maxHalfWidth * 1.02 },
    { x: halfLength - blueprint.hoodLength * 0.76, bottomY: 0.38, beltY: 0.96, crownY: 1.02, halfWidth: maxHalfWidth * 0.99 },
    { x: halfLength - blueprint.hoodLength * 0.26, bottomY: 0.39, beltY: 0.86, crownY: 0.9, halfWidth: maxHalfWidth * 0.9 },
    { x: halfLength, bottomY: 0.42, beltY: 0.76, crownY: 0.76, halfWidth: maxHalfWidth * 0.72 },
  ]
}

const mixStation = (from: BodyStation, to: BodyStation, alpha: number): BodyStation => ({
  x: THREE.MathUtils.lerp(from.x, to.x, alpha),
  bottomY: THREE.MathUtils.lerp(from.bottomY, to.bottomY, alpha),
  beltY: THREE.MathUtils.lerp(from.beltY, to.beltY, alpha),
  crownY: THREE.MathUtils.lerp(from.crownY, to.crownY, alpha),
  halfWidth: THREE.MathUtils.lerp(from.halfWidth, to.halfWidth, alpha),
})

const densifyStations = (stations: BodyStation[]) => {
  const dense: BodyStation[] = []
  stations.forEach((station, index) => {
    dense.push(station)
    const next = stations[index + 1]
    if (next) {
      dense.push(mixStation(station, next, 1 / 3))
      dense.push(mixStation(station, next, 2 / 3))
    }
  })
  return dense
}

const createBodyShell = (material: THREE.Material, blueprint: SedanBlueprint) => {
  const shellStations = densifyStations(createShellStations(blueprint))
  const vertices: number[] = []
  const indices: number[] = []
  const ringSize = 10

  shellStations.forEach(({ x, bottomY, beltY, crownY, halfWidth }) => {
    const midY = (bottomY + beltY) / 2
    const ring: Array<[number, number, number]> = [
      [x, crownY + 0.01, 0],
      [x, crownY - 0.03, -halfWidth * 0.52],
      [x, beltY + 0.06, -halfWidth * 0.88],
      [x, midY, -halfWidth],
      [x, bottomY, -halfWidth * 0.82],
      [x, bottomY - 0.04, 0],
      [x, bottomY, halfWidth * 0.82],
      [x, midY, halfWidth],
      [x, beltY + 0.06, halfWidth * 0.88],
      [x, crownY - 0.03, halfWidth * 0.52],
    ]
    ring.forEach(([vx, vy, vz]) => vertices.push(vx, vy, vz))
  })

  for (let station = 0; station < shellStations.length - 1; station += 1) {
    const current = station * ringSize
    const next = (station + 1) * ringSize
    for (let point = 0; point < ringSize; point += 1) {
      const after = (point + 1) % ringSize
      indices.push(current + point, next + point, next + after)
      indices.push(current + point, next + after, current + after)
    }
  }

  const cap = (station: number, reverse: boolean) => {
    const base = station * ringSize
    for (let point = 1; point < ringSize - 1; point += 1) {
      indices.push(...(reverse ? [base, base + point + 1, base + point] : [base, base + point, base + point + 1]))
    }
  }
  cap(0, true)
  cap(shellStations.length - 1, false)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'continuous-wedge-body-shell'
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

const createSidePanel = (name: string, points: THREE.Vector2[], material: THREE.Material, zSide: number) => {
  const triangles = THREE.ShapeUtils.triangulateShape(points, [])
  const vertices = points.flatMap((point) => [point.x, point.y, zSide])
  const indices = triangles.flatMap(([a, b, c]) => zSide > 0 ? [a, b, c] : [a, c, b])
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  return mesh
}

const smoothPoints = (points: Array<[number, number]>, segments = 18) => {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'catmullrom', 0.34)
  return curve.getPoints(segments).map((point) => new THREE.Vector2(point.x, point.y))
}

const createGlassRibbonPoints = (inset = 0) => {
  const top = smoothPoints([
    [0.96 - inset, 1.11 + inset * 0.16],
    [0.42, 1.46 + inset * 0.1],
    [-0.36, 1.6 - inset * 0.06],
    [-1.18, 1.5 - inset * 0.1],
    [-2.02, 1.16 + inset * 0.04],
    [-2.74 + inset, 0.92 + inset * 0.08],
  ], 28)
  const bottom = smoothPoints([
    [-2.68 + inset, 0.88 + inset * 0.12],
    [-2.2, 0.94 + inset * 0.08],
    [-1.64, 1.11 + inset * 0.04],
    [-1.38, 1.25 - inset * 0.04],
    [-1.04, 1.15 + inset * 0.04],
    [-0.04, 1.18],
    [0.76 - inset, 1.16 + inset * 0.1],
  ], 28)
  return [...top, ...bottom]
}

const createQuad = (name: string, corners: Array<[number, number, number]>, material: THREE.Material) => {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(corners.flat(), 3))
  geometry.setIndex([0, 1, 2, 0, 2, 3])
  geometry.computeVertexNormals()
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  return mesh
}

const createPaintedRoofSkin = (material: THREE.Material, blueprint: SedanBlueprint) => {
  const path = smoothPoints([
    [0.88, 1.12],
    [0.2, 1.56],
    [blueprint.roofPeakX, blueprint.height + 0.25],
    [-1.16, 1.47],
    [-2.76, 0.9],
  ], 36)
  const vertices: number[] = []
  const indices: number[] = []

  path.forEach((point) => {
    const rearBias = THREE.MathUtils.clamp((-point.x - 1.2) / 1.7, 0, 1)
    const zHalf = THREE.MathUtils.lerp(0.36, 0.5, rearBias)
    vertices.push(point.x, point.y + 0.006, -zHalf)
    vertices.push(point.x, point.y + 0.006, zHalf)
  })

  for (let index = 0; index < path.length - 1; index += 1) {
    const current = index * 2
    const next = current + 2
    indices.push(current, next, next + 1)
    indices.push(current, next + 1, current + 1)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'continuous-painted-fastback-roof-skin'
  mesh.castShadow = true
  mesh.receiveShadow = true
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

  group.add(createLine(`${side}-shoulder-character-line`, [
    new THREE.Vector3(2.86, 0.88, shoulderZ),
    new THREE.Vector3(1.34, 1.03, shoulderZ),
    new THREE.Vector3(-0.38, 1.08, shoulderZ),
    new THREE.Vector3(-2.62, 0.9, shoulderZ),
  ], '#2b3544', 0.86))
  group.add(createLine(`${side}-lower-door-crease`, [
    new THREE.Vector3(2.28, 0.64, shoulderZ),
    new THREE.Vector3(0.44, 0.62, shoulderZ),
    new THREE.Vector3(-2.42, 0.58, shoulderZ),
  ], '#151b23', 0.68))

  group.add(createSidePanel(`${side}-side-glass-trim`, createGlassRibbonPoints(0), materials.darkChrome, trimZ))
  group.add(createSidePanel(`${side}-continuous-side-glass-ribbon`, createGlassRibbonPoints(0.08), materials.glass, trimZ + Math.sign(zSide) * 0.008))
  group.add(createLine(`${side}-integrated-hofmeister-kink`, [
    new THREE.Vector3(-2.12, 0.95, trimZ + Math.sign(zSide) * 0.016),
    new THREE.Vector3(-1.38, 1.25, trimZ + Math.sign(zSide) * 0.016),
    new THREE.Vector3(-1.04, 1.15, trimZ + Math.sign(zSide) * 0.016),
  ], '#080a0d', 0.92))

  ;[
    ['front-door-cut', 0.52],
    ['rear-door-cut', -0.74],
    ['rear-quarter-cut', -1.62],
  ].forEach(([suffix, x]) => {
    group.add(createLine(`${side}-${suffix}`, [
      new THREE.Vector3(Number(x), 0.6, doorLineZ),
      new THREE.Vector3(Number(x) - 0.03, 1.14, doorLineZ),
    ], '#0d1118', 0.66))
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

  group.add(createBodyShell(materials.paint, blueprint))
  group.add(createPaintedRoofSkin(materials.paint, blueprint))

  const roofHighlight = createLine('single-arc-roof-highlight', [
    new THREE.Vector3(0.82, 1.18, 0),
    new THREE.Vector3(-0.28, 1.54, 0),
    new THREE.Vector3(-1.5, 1.32, 0),
    new THREE.Vector3(-2.82, 0.88, 0),
  ], '#303b4d', 0.34)
  group.add(roofHighlight)

  group.add(createQuad('raked-front-windshield', [
    [0.86, 1.13, -0.5],
    [0.86, 1.13, 0.5],
    [0.18, 1.56, 0.43],
    [0.18, 1.56, -0.43],
  ], materials.glass))
  group.add(createQuad('fastback-rear-window', [
    [-1.14, 1.47, -0.42],
    [-1.14, 1.47, 0.42],
    [-2.76, 0.9, 0.5],
    [-2.76, 0.9, -0.5],
  ], materials.glass))

  const frontSplitter = createRoundedBox([0.16, 0.06, blueprint.width * 0.78], materials.darkChrome, 0.025, 4, 'subtle-lower-front-splitter')
  frontSplitter.position.set(3.17, 0.48, 0)
  frontSplitter.castShadow = true
  group.add(frontSplitter)

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
