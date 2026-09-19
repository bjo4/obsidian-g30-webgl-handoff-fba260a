export interface SedanBlueprint {
  length: number
  width: number
  height: number
  hoodLength: number
  cabinLength: number
  wheelbase: number
  doors: number[]
  branding: 'none'
  frontGrilleSlats: number
  rearQuarterWindowKink: boolean
}

export function createSedanBlueprint(): SedanBlueprint {
  return {
    length: 6.35,
    width: 2.04,
    height: 1.38,
    hoodLength: 1.72,
    cabinLength: 2.28,
    wheelbase: 3.76,
    doors: [-1.45, -0.45, 0.45, 1.45],
    branding: 'none',
    frontGrilleSlats: 2,
    rearQuarterWindowKink: true,
  }
}
