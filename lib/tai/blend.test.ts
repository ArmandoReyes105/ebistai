import { describe, expect, it } from "vitest"

import { blendSnapshots, colorProgress, createSnapshot } from "./blend"
import { hexToRgb } from "./color"
import { POSE_IDS } from "./types"

const RED = hexToRgb("#FF1727")
const NAVY = hexToRgb("#1C2A89")

describe("createSnapshot", () => {
  it("copies a pose without sharing buffers", () => {
    const a = createSnapshot("neutral")
    const b = createSnapshot("neutral")
    expect(a).toEqual(b)
    a.shapes.body[0] = 999
    expect(b.shapes.body[0]).not.toBe(999)
  })

  it("seeds the cold top stop and upper fin with navy", () => {
    const cold = createSnapshot("cold")
    expect(cold.colors.body0).toEqual(NAVY)
    expect(cold.colors.upperFin).toEqual(NAVY)
    expect(cold.colors.body2).toEqual(RED)
  })
})

describe("blendSnapshots", () => {
  it("equals the source at 0 and the target at 1 for every pose pair", () => {
    for (const a of POSE_IDS) {
      for (const b of POSE_IDS) {
        const from = createSnapshot(a)
        const to = createSnapshot(b)
        const toCold = b === "cold"
        expect(blendSnapshots(from, to, 0, colorProgress(toCold, 0))).toEqual(
          from
        )
        expect(blendSnapshots(from, to, 1, colorProgress(toCold, 1))).toEqual(
          to
        )
      }
    }
  })

  it("interpolates geometry and offset with the geometry progress", () => {
    const from = createSnapshot("neutral")
    const to = createSnapshot("sad")
    const mid = blendSnapshots(from, to, 0.5, colorProgress(false, 0.5))
    expect(mid.shapes.body[0]).toBeCloseTo(
      (from.shapes.body[0] + to.shapes.body[0]) / 2
    )
    expect(mid.offset[1]).toBeCloseTo((from.offset[1] + to.offset[1]) / 2)
  })

  it("keeps colors in range when geometry overshoots", () => {
    const from = createSnapshot("neutral")
    const to = createSnapshot("cold")
    const over = blendSnapshots(from, to, 1.1, colorProgress(true, 0.9))
    for (const channel of over.colors.upperFin) {
      expect(channel).toBeGreaterThanOrEqual(0)
      expect(channel).toBeLessThanOrEqual(255)
    }
  })
})

describe("colorProgress", () => {
  it("frost creeps down: the top leads the middle when entering cold", () => {
    const p = colorProgress(true, 0.4)
    expect(p.body0).toBeGreaterThan(p.body1)
    expect(p.upperFin).toBeGreaterThan(p.secondUpperFin)
  })

  it("drains upward when leaving cold: the middle leads the top", () => {
    const p = colorProgress(false, 0.4)
    expect(p.body1).toBeGreaterThan(p.body0)
    expect(p.secondUpperFin).toBeGreaterThan(p.upperFin)
  })

  it("is 0 at the start and 1 at the end for every key", () => {
    for (const toCold of [true, false]) {
      for (const v of Object.values(colorProgress(toCold, 0))) expect(v).toBe(0)
      for (const v of Object.values(colorProgress(toCold, 1))) expect(v).toBe(1)
    }
  })

  it("never decreases over time", () => {
    for (const toCold of [true, false]) {
      let prev = colorProgress(toCold, 0)
      for (let i = 1; i <= 20; i++) {
        const next = colorProgress(toCold, i / 20)
        for (const key of Object.keys(next) as (keyof typeof next)[]) {
          expect(next[key]).toBeGreaterThanOrEqual(prev[key])
        }
        prev = next
      }
    }
  })
})
