export interface SedanBlueprint {
  length: number
  width: number
  height: number
  hoodLength: number
  cabinLength: number
  cabinCenterX: number
  roofPeakX: number
  rearDeckLength: number
  rearTrackTaper: number
  wheelbase: number
  doors: number[]
  branding: 'none'
  frontGrilleSlats: number
  rearQuarterWindowKink: boolean
}

export function createSedanBlueprint(): SedanBlueprint {
  return {
    length: 6.42,
    width: 2.06,
    height: 1.35,
    hoodLength: 1.92,
    cabinLength: 2.3,
    cabinCenterX: -0.58,
    roofPeakX: -0.3,
    rearDeckLength: 1.18,
    rearTrackTaper: 0.18,
    wheelbase: 3.86,
    doors: [-1.54, -0.52, 0.52, 1.52],
    branding: 'none',
    frontGrilleSlats: 2,
    rearQuarterWindowKink: true,
  }
}
