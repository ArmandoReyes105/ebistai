import { matchSegments, parsePath, pathBounds } from "./path"
import type { PathShape } from "./path"
import { POSE_PATHS } from "./pose-paths"
import { POSE_IDS, TAI_LAYERS } from "./types"
import type { PoseId, TaiLayer } from "./types"

export type PoseShapes = Record<TaiLayer, number[]>
export type Offset = readonly [number, number]

const RED = "#FF1727"
const BELLY = "#FEDFC8"
const EYE = "#000000"
const NAVY = "#1C2A89"
const PLUM = "#952756"

type SolidLayer = Exclude<TaiLayer, "body">

export interface PosePaint {
  fills: Record<SolidLayer, string>
  /** Vertical body gradient, top to bottom. Solid red when all three match. */
  bodyStops: readonly [string, string, string]
}

const solid: Record<SolidLayer, string> = {
  tail: RED,
  secondUpperFin: RED,
  upperFin: RED,
  backFin: RED,
  panza: BELLY,
  rightEye: EYE,
  leftEye: EYE,
  fin: RED,
}

export const POSE_PAINTS: Record<PoseId, PosePaint> = {
  neutral: { fills: solid, bodyStops: [RED, RED, RED] },
  sleep: { fills: solid, bodyStops: [RED, RED, RED] },
  sad: { fills: solid, bodyStops: [RED, RED, RED] },
  cold: {
    fills: { ...solid, upperFin: NAVY, secondUpperFin: PLUM },
    bodyStops: [NAVY, PLUM, RED],
  },
}

/** Gradient stop offsets and vertical extent, in cold's own frame. */
export const COLD_GRADIENT = {
  offsets: [0, 0.269231, 0.528846],
  x: 88.6633,
  y1: 12.4042,
  y2: 151.924,
} as const

/** Parsed straight from the Figma paths, no changes. */
export const RAW_SHAPES: Record<PoseId, PoseShapes> = Object.fromEntries(
  POSE_IDS.map((pose) => [
    pose,
    Object.fromEntries(
      TAI_LAYERS.map((layer) => [layer, parsePath(POSE_PATHS[pose][layer])])
    ),
  ])
) as Record<PoseId, PoseShapes>

/**
 * Per-pose translation that puts every pose in the reference pose's frame:
 * the body's lowest point and the body's horizontal center line up.
 * Points are never edited, only translated.
 */
export function computeOffsets(
  shapes: Record<PoseId, PoseShapes>,
  reference: PoseId
): Record<PoseId, Offset> {
  const anchor = (pose: PoseId) => {
    const b = pathBounds(shapes[pose].body)
    return { cx: (b.minX + b.maxX) / 2, bottom: b.maxY }
  }
  const ref = anchor(reference)
  return Object.fromEntries(
    POSE_IDS.map((pose) => {
      const a = anchor(pose)
      return [pose, [ref.cx - a.cx, ref.bottom - a.bottom] as const]
    })
  ) as Record<PoseId, Offset>
}

export const REFERENCE_POSE: PoseId = "neutral"
export const POSE_OFFSETS = computeOffsets(RAW_SHAPES, REFERENCE_POSE)

const segmentCount = (shape: PathShape) => (shape.length - 2) / 6

/** Layers whose Figma paths do not share one segment count across poses. */
export const SOURCE_MISMATCHED_LAYERS: readonly TaiLayer[] = TAI_LAYERS.filter(
  (layer) =>
    new Set(POSE_IDS.map((pose) => segmentCount(RAW_SHAPES[pose][layer])))
      .size > 1
)

/**
 * Shapes ready to interpolate. Layers that already share a segment count are
 * untouched. For mismatched layers (see SOURCE_MISMATCHED_LAYERS) the poses
 * with fewer segments get lossless midpoint splits (same drawn curve, one more
 * anchor) so every pose has the count of the richest one.
 */
export const POSE_SHAPES: Record<PoseId, PoseShapes> = (() => {
  const shapes = Object.fromEntries(
    POSE_IDS.map((pose) => [pose, { ...RAW_SHAPES[pose] }])
  ) as Record<PoseId, PoseShapes>
  for (const layer of SOURCE_MISMATCHED_LAYERS) {
    const richest = POSE_IDS.reduce((best, pose) =>
      segmentCount(RAW_SHAPES[pose][layer]) >
      segmentCount(RAW_SHAPES[best][layer])
        ? pose
        : best
    )
    const [rx, ry] = POSE_OFFSETS[richest]
    for (const pose of POSE_IDS) {
      const [dx, dy] = POSE_OFFSETS[pose]
      shapes[pose][layer] = matchSegments(
        RAW_SHAPES[pose][layer],
        RAW_SHAPES[richest][layer],
        [dx - rx, dy - ry]
      )
    }
  }
  return shapes
})()

/**
 * Shared frame: the union of every pose after alignment (x -23.4..198,
 * y 0..167.5), plus room for the fin shadow and the sleep "Z" glyphs.
 */
export const TAI_VIEW_BOX = "-28 -16 263 196"
