import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { createSedanBlueprint } from './blueprint'
import { createCar } from './createCar'
import { createCarMaterials } from './materials'

const find = (root: THREE.Object3D, name: string) => {
  const object = root.getObjectByName(name)
  expect(object, `${name} should be present`).toBeDefined()
  return object as THREE.Object3D
}

describe('createSedanBlueprint', () => {
  it('encodes long-wheelbase rear-set streamlined sedan proportions without branding', () => {
    const blueprint = createSedanBlueprint()

    expect(blueprint.branding).toBe('none')
    expect(blueprint.doors).toHaveLength(4)
    expect(blueprint.wheelbase / blueprint.length).toBeGreaterThanOrEqual(0.59)
    expect(blueprint.hoodLength / blueprint.length).toBeGreaterThanOrEqual(0.29)
    expect(blueprint.height / blueprint.length).toBeLessThan(0.22)
    expect(blueprint.cabinCenterX).toBeLessThan(-0.35)
    expect(blueprint.roofPeakX).toBeLessThan(0)
    expect(blueprint.rearDeckLength / blueprint.length).toBeLessThanOrEqual(0.2)
    expect(blueprint.rearTrackTaper).toBeGreaterThanOrEqual(0.12)
    expect(blueprint.rearQuarterWindowKink).toBe(true)
  })
})

describe('createCar', () => {
  const widthNear = (geometry: THREE.BufferGeometry, targetX: number) => {
    const position = geometry.getAttribute('position')
    const zValues: number[] = []
    for (let index = 0; index < position.count; index += 1) {
      if (Math.abs(position.getX(index) - targetX) < 0.03) {
        zValues.push(position.getZ(index))
      }
    }
    expect(zValues.length, `expected vertices near x=${targetX}`).toBeGreaterThan(0)
    return Math.max(...zValues) - Math.min(...zValues)
  }

  const topYNear = (geometry: THREE.BufferGeometry, targetX: number) => {
    const position = geometry.getAttribute('position')
    const yValues: number[] = []
    for (let index = 0; index < position.count; index += 1) {
      if (Math.abs(position.getX(index) - targetX) < 0.03) {
        yValues.push(position.getY(index))
      }
    }
    expect(yValues.length, `expected vertices near x=${targetX}`).toBeGreaterThan(0)
    return Math.max(...yValues)
  }

  it('builds one continuous tapered wedge body shell instead of stacked paint boxes', () => {
    const { group, materials } = createCar()
    const blueprint = createSedanBlueprint()
    const shell = find(group, 'continuous-wedge-body-shell') as THREE.Mesh<THREE.BufferGeometry, THREE.Material>

    expect(shell.geometry).toBeInstanceOf(THREE.BufferGeometry)
    expect(shell.material).toBe(materials.paint)
    expect(shell.geometry.getAttribute('position').count).toBeGreaterThan(180)
    expect(group.getObjectByName('long-hood')).toBeUndefined()
    expect(group.getObjectByName('short-rear-deck')).toBeUndefined()
    expect(group.getObjectByName('rear-set-smoked-cabin')).toBeUndefined()

    expect(topYNear(shell.geometry, 3.21)).toBeLessThan(topYNear(shell.geometry, 0.74))
    expect(topYNear(shell.geometry, -2.72)).toBeLessThan(topYNear(shell.geometry, blueprint.roofPeakX))
    expect(widthNear(shell.geometry, -blueprint.length / 2)).toBeLessThan(widthNear(shell.geometry, -1.22) * (1 - blueprint.rearTrackTaper * 0.5))
  })

  it('uses gradual fastback roof stations without an abrupt notchback drop', () => {
    const { group } = createCar()
    const blueprint = createSedanBlueprint()
    const shell = find(group, 'continuous-wedge-body-shell') as THREE.Mesh<THREE.BufferGeometry>

    expect(topYNear(shell.geometry, blueprint.roofPeakX) - topYNear(shell.geometry, -1.22)).toBeLessThan(0.18)
    expect(topYNear(shell.geometry, -1.22) - topYNear(shell.geometry, -1.92)).toBeLessThan(0.2)
    expect(topYNear(shell.geometry, -1.92) - topYNear(shell.geometry, -2.36)).toBeLessThan(0.22)
    expect(topYNear(shell.geometry, -2.36) - topYNear(shell.geometry, -2.95)).toBeLessThan(0.22)
  })

  it('uses a continuous side glass ribbon with an integrated Hofmeister kink', () => {
    const { group } = createCar()
    const rightGlass = find(group, 'right-continuous-side-glass-ribbon') as THREE.Mesh<THREE.BufferGeometry>

    rightGlass.geometry.computeBoundingBox()
    const glassBounds = rightGlass.geometry.boundingBox
    expect(glassBounds).not.toBeNull()
    expect(glassBounds?.min.x).toBeLessThan(-2.0)
    expect(glassBounds?.max.x).toBeGreaterThan(0.78)
    expect(glassBounds?.max.y).toBeGreaterThan(1.52)
    expect(glassBounds?.min.y).toBeGreaterThan(0.84)

    find(group, 'left-continuous-side-glass-ribbon')
    find(group, 'left-integrated-hofmeister-kink')
    find(group, 'right-integrated-hofmeister-kink')
  })

  it('adds painted roof skin under the fastback glass so the greenhouse does not float', () => {
    const { group, materials } = createCar()
    const rightGlass = find(group, 'right-continuous-side-glass-ribbon') as THREE.Mesh<THREE.BufferGeometry>
    const roofSkin = find(group, 'continuous-painted-fastback-roof-skin') as THREE.Mesh<THREE.BufferGeometry, THREE.Material>

    rightGlass.geometry.computeBoundingBox()
    roofSkin.geometry.computeBoundingBox()
    expect(roofSkin.material).toBe(materials.paint)
    expect(roofSkin.geometry.boundingBox?.max.y).toBeGreaterThanOrEqual((rightGlass.geometry.boundingBox?.max.y ?? 0) - 0.03)
    expect(roofSkin.geometry.boundingBox?.min.x).toBeLessThan(-2.7)
    expect(roofSkin.geometry.boundingBox?.max.x).toBeGreaterThan(0.75)
  })

  it('builds distinct twin vertical grille apertures and wide front light blades', () => {
    const { group } = createCar()
    const leftKidney = find(group, 'left-kidney-aperture')
    const rightKidney = find(group, 'right-kidney-aperture')
    const leftHeadlight = find(group, 'left-wraparound-headlight')
    const rightHeadlight = find(group, 'right-wraparound-headlight')

    expect(leftKidney.position.x).toBeCloseTo(rightKidney.position.x, 3)
    expect(leftKidney.position.z).toBeLessThan(rightKidney.position.z)
    expect(leftKidney.scale.y).toBeGreaterThan(leftKidney.scale.z)
    expect(rightKidney.scale.y).toBeGreaterThan(rightKidney.scale.z)
    expect(Math.abs(leftHeadlight.position.z)).toBeGreaterThan(Math.abs(leftKidney.position.z))
    expect(Math.abs(rightHeadlight.position.z)).toBeGreaterThan(Math.abs(rightKidney.position.z))
  })

  it('marks continuous side glass, integrated Hofmeister kink, shoulder line, lower crease, door cuts, and L-shaped tail lights', () => {
    const { group } = createCar()

    find(group, 'left-side-glass-trim')
    find(group, 'right-side-glass-trim')
    find(group, 'left-continuous-side-glass-ribbon')
    find(group, 'right-continuous-side-glass-ribbon')
    find(group, 'left-integrated-hofmeister-kink')
    find(group, 'right-integrated-hofmeister-kink')
    find(group, 'left-shoulder-character-line')
    find(group, 'right-shoulder-character-line')
    find(group, 'left-lower-door-crease')
    find(group, 'right-lower-door-crease')
    find(group, 'left-front-door-cut')
    find(group, 'right-front-door-cut')
    find(group, 'left-rear-door-cut')
    find(group, 'right-rear-door-cut')
    find(group, 'left-tail-l-horizontal')
    find(group, 'left-tail-l-vertical')
    find(group, 'right-tail-l-horizontal')
    find(group, 'right-tail-l-vertical')
  })

  it('uses filled-arch low-profile multi-spoke wheels', () => {
    const { group } = createCar()
    const frontLeftWheel = find(group, 'front-left-wheel')
    const tire = find(frontLeftWheel, 'low-profile-tire') as THREE.Mesh
    const spokes = frontLeftWheel.children.filter((child) => child.name.startsWith('dark-multi-spoke-rim-'))

    expect(spokes).toHaveLength(12)
    expect(tire.scale.y).toBeLessThanOrEqual(0.82)
  })
})

describe('createCarMaterials', () => {
  it('uses glossy black metallic paint, smoked glass, and dark chrome trim', () => {
    const materials = createCarMaterials()

    expect(materials.paint.color.getHexString()).toBe('030304')
    expect(materials.paint.metalness).toBeGreaterThanOrEqual(0.9)
    expect(materials.paint.roughness).toBeLessThanOrEqual(0.2)
    expect(materials.paint.clearcoat).toBe(1)
    expect(materials.paint.clearcoatRoughness).toBeGreaterThanOrEqual(0.12)
    expect(materials.glass.opacity).toBeLessThanOrEqual(0.5)
    expect(materials.darkChrome.metalness).toBe(1)
    expect(materials.light.emissiveIntensity).toBeLessThanOrEqual(0.35)
    expect(materials.tailLight.emissiveIntensity).toBeLessThanOrEqual(0.55)
  })
})
