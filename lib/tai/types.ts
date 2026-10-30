export const POSE_IDS = ["neutral", "sleep", "cold", "sad"] as const
export type PoseId = (typeof POSE_IDS)[number]

/** Paint order, back to front. Every pose has exactly these layers. */
export const TAI_LAYERS = [
  "tail",
  "secondUpperFin",
  "upperFin",
  "backFin",
  "body",
  "panza",
  "rightEye",
  "leftEye",
  "fin",
] as const
export type TaiLayer = (typeof TAI_LAYERS)[number]

export type Rgb = readonly [number, number, number]
