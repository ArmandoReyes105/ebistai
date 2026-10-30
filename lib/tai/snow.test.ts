import { describe, expect, it } from "vitest"

import { TAI_VIEW_BOX, POSE_OFFSETS, POSE_SHAPES } from "./poses"
import { SNOWFLAKES, SNOW_DRIFT, SNOW_MARGIN, snowflakePath } from "./snow"

describe("snowflakePath", () => {
  it("draws six arms with two branches each, from strokes only", () => {
    const d = snowflakePath(10)
    expect(d.match(/M/g)?.length).toBe(6 * 3)
    expect(d).not.toMatch(/[CZz]/)
  })

  it("stays inside its radius", () => {
    const nums = snowflakePath(10)
      .match(/-?\d+\.?\d*/g)!
      .map(Number)
    for (let i = 0; i < nums.length; i += 2) {
      expect(Math.hypot(nums[i], nums[i + 1])).toBeLessThanOrEqual(10.01)
    }
  })
})

function bodyOutline(steps = 40) {
  const shape = POSE_SHAPES.cold.body
  const [dx, dy] = POSE_OFFSETS.cold
  const pts: [number, number][] = []
  let x0 = shape[0]
  let y0 = shape[1]
  for (let i = 2; i < shape.length; i += 6) {
    const [x1, y1, x2, y2, x3, y3] = shape.slice(i, i + 6)
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const u = 1 - t
      const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
      pts.push([
        w[0] * x0 + w[1] * x1 + w[2] * x2 + w[3] * x3 + dx,
        w[0] * y0 + w[1] * y1 + w[2] * y2 + w[3] * y3 + dy,
      ])
    }
    x0 = x3
    y0 = y3
  }
  return pts
}

describe("SNOWFLAKES", () => {
  it("has 3 flakes of different sizes", () => {
    expect(SNOWFLAKES).toHaveLength(3)
    expect(new Set(SNOWFLAKES.map((f) => f.r)).size).toBe(3)
  })

  it("keeps every flake, along its whole drift, inside the view box", () => {
    const [x, y, w, h] = TAI_VIEW_BOX.split(" ").map(Number)
    for (const f of SNOWFLAKES) {
      const reach = f.r + SNOW_MARGIN
      expect(f.x - reach - Math.abs(SNOW_DRIFT.startX)).toBeGreaterThanOrEqual(
        x
      )
      expect(f.x + reach + SNOW_DRIFT.endX).toBeLessThanOrEqual(x + w)
      expect(f.y - reach + SNOW_DRIFT.startY).toBeGreaterThanOrEqual(y)
      expect(f.y + reach + SNOW_DRIFT.endY).toBeLessThanOrEqual(y + h)
    }
  })

  it("never touches the cold body along its drift", () => {
    const outline = bodyOutline()
    for (const f of SNOWFLAKES) {
      for (const k of [0, 0.25, 0.5, 0.75, 1]) {
        const cx =
          f.x + SNOW_DRIFT.startX + (SNOW_DRIFT.endX - SNOW_DRIFT.startX) * k
        const cy =
          f.y + SNOW_DRIFT.startY + (SNOW_DRIFT.endY - SNOW_DRIFT.startY) * k
        const nearest = Math.min(
          ...outline.map(([px, py]) => Math.hypot(px - cx, py - cy))
        )
        expect(nearest).toBeGreaterThan(f.r)
      }
    }
  })
})
