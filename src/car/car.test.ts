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
  it('encodes long-wheelbase rear-set four-door sedan proportions without branding', () => {
    const blueprint = createSedanBlueprint()

    expect(blueprint.branding).toBe('none')
    expect(blueprint.doors).toHaveLength(4)
    expect(blueprint.wheelbase / blueprint.length).toBeGreaterThanOrEqual(0.59)
    expect(blueprint.hoodLength / blueprint.length).toBeGreaterThanOrEqual(0.29)
    expect(blueprint.height / blueprint.length).toBeLessThan(0.22)
    expect(blueprint.cabinCenterX).toBeLessThan(-0.35)
    expect(blueprint.rearQuarterWindowKink).toBe(true)
  })
})

describe('createCar', () => {
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

  it('marks side glass, Hofmeister kink, shoulder line, lower crease, door cuts, and L-shaped tail lights', () => {
    const { group } = createCar()

    find(group, 'left-side-glass-trim')
    find(group, 'right-side-glass-trim')
    find(group, 'left-hofmeister-kink')
    find(group, 'right-hofmeister-kink')
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
  })
})
