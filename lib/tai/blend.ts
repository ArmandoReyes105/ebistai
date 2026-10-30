import { lerpRgb, hexToRgb } from "./color"
import { lerpShape } from "./path"
import { POSE_OFFSETS, POSE_PAINTS, POSE_SHAPES } from "./poses"
import { TAI_LAYERS } from "./types"
import type { PoseId, Rgb, TaiLayer } from "./types"

export type SolidLayer = Exclude<TaiLayer, "body">
export const BODY_STOPS = ["body0", "body1", "body2"] as const
export type BodyStop = (typeof BODY_STOPS)[number]
export type ColorKey = SolidLayer | BodyStop

export const COLOR_KEYS: readonly ColorKey[] = [
  ...TAI_LAYERS.filter((layer): layer is SolidLayer => layer !== "body"),
  ...BODY_STOPS,
]

/** Everything that changes while Tai morphs. Mutable buffers, reused per frame. */
export interface TaiSnapshot {
  shapes: Record<TaiLayer, number[]>
  offset: [number, number]
  colors: Record<ColorKey, Rgb>
}

export function createSnapshot(pose: PoseId): TaiSnapshot {
  const paint = POSE_PAINTS[pose]
  const colors = {} as Record<ColorKey, Rgb>
  for (const key of COLOR_KEYS) {
    if (key === "body0") colors[key] = hexToRgb(paint.bodyStops[0])
    else if (key === "body1") colors[key] = hexToRgb(paint.bodyStops[1])
    else if (key === "body2") colors[key] = hexToRgb(paint.bodyStops[2])
    else colors[key] = hexToRgb(paint.fills[key])
  }
  const shapes = {} as Record<TaiLayer, number[]>
  for (const layer of TAI_LAYERS) shapes[layer] = [...POSE_SHAPES[pose][layer]]
  const [dx, dy] = POSE_OFFSETS[pose]
  return { shapes, offset: [dx, dy], colors }
}

export function cloneSnapshot(snapshot: TaiSnapshot): TaiSnapshot {
  return {
    shapes: Object.fromEntries(
      TAI_LAYERS.map((layer) => [layer, [...snapshot.shapes[layer]]])
    ) as Record<TaiLayer, number[]>,
    offset: [...snapshot.offset],
    colors: { ...snapshot.colors },
  }
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)
const window01 = (t: number, start: number, end: number) =>
  smoothstep(Math.min(1, Math.max(0, (t - start) / (end - start))))

/** Keys whose color depends on how high they sit on the fish. */
const TOP_GROUP: readonly ColorKey[] = ["body0", "upperFin"]
const MID_GROUP: readonly ColorKey[] = ["body1", "secondUpperFin"]

/**
 * Per-key color progress for a transition at raw time `t` in [0, 1].
 * Entering cold the top group leads, so frost creeps down; leaving cold the
 * middle group leads, so the color drains upward. Every key is 0 at t = 0
 * and 1 at t = 1, and never decreases.
 */
export function colorProgress(
  towardCold: boolean,
  t: number
): Record<ColorKey, number> {
  const lead = (t: number) => window01(t, 0, 0.65)
  const lag = (t: number) => window01(t, 0.3, 1)
  const progress = {} as Record<ColorKey, number>
  for (const key of COLOR_KEYS) progress[key] = window01(t, 0, 1)
  for (const key of TOP_GROUP) progress[key] = towardCold ? lead(t) : lag(t)
  for (const key of MID_GROUP) progress[key] = towardCold ? lag(t) : lead(t)
  return progress
}

/**
 * Blend two snapshots. `geometry` may overshoot [0, 1] (back easings); colors
 * use their own bounded progress. Pass `out` to avoid per-frame allocation.
 */
export function blendSnapshots(
  from: TaiSnapshot,
  to: TaiSnapshot,
  geometry: number,
  colors: Record<ColorKey, number>,
  out: TaiSnapshot = cloneSnapshot(from)
): TaiSnapshot {
  for (const layer of TAI_LAYERS) {
    lerpShape(from.shapes[layer], to.shapes[layer], geometry, out.shapes[layer])
  }
  out.offset[0] =
    geometry === 1
      ? to.offset[0]
      : from.offset[0] + (to.offset[0] - from.offset[0]) * geometry
  out.offset[1] =
    geometry === 1
      ? to.offset[1]
      : from.offset[1] + (to.offset[1] - from.offset[1]) * geometry
  for (const key of COLOR_KEYS) {
    out.colors[key] = lerpRgb(from.colors[key], to.colors[key], colors[key])
  }
  return out
}
