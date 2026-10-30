import { pathBounds } from "./path"
import { POSE_OFFSETS, POSE_SHAPES } from "./poses"
import { TAI_LAYERS } from "./types"
import type { PoseId } from "./types"

/**
 * viewBox that hugs a pose (in the shared frame, offset applied) plus
 * `margin` on every side. Used to crop the canvas for logo sizes.
 */
export function poseViewBox(pose: PoseId, margin = 0): string {
  const [dx, dy] = POSE_OFFSETS[pose]
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const layer of TAI_LAYERS) {
    const b = pathBounds(POSE_SHAPES[pose][layer])
    minX = Math.min(minX, b.minX + dx)
    minY = Math.min(minY, b.minY + dy)
    maxX = Math.max(maxX, b.maxX + dx)
    maxY = Math.max(maxY, b.maxY + dy)
  }
  const round = (n: number) => Math.round(n * 10) / 10
  return [
    round(minX - margin),
    round(minY - margin),
    round(maxX - minX + 2 * margin),
    round(maxY - minY + 2 * margin),
  ].join(" ")
}
