import { describe, expect, it } from "vitest"

import { commandSignature, pathBounds } from "./path"
import { POSE_PATHS } from "./pose-paths"
import {
  POSE_OFFSETS,
  POSE_PAINTS,
  POSE_SHAPES,
  RAW_SHAPES,
  SOURCE_MISMATCHED_LAYERS,
  TAI_VIEW_BOX,
  computeOffsets,
} from "./poses"
import { POSE_IDS, TAI_LAYERS } from "./types"

describe("source geometry", () => {
  it("has the same 9 layers in the same paint order for every pose", () => {
    for (const pose of POSE_IDS) {
      expect(Object.keys(POSE_PATHS[pose])).toEqual([...TAI_LAYERS])
    }
  })

  it("reports which layers do not share a segment count in the source", () => {
    // The Figma eyes were drawn with different numbers of anchors.
    expect([...SOURCE_MISMATCHED_LAYERS]).toEqual(["rightEye", "leftEye"])
  })

  it.each(TAI_LAYERS.filter((l) => !SOURCE_MISMATCHED_LAYERS.includes(l)))(
    "layer %s has an identical command sequence in all poses",
    (layer) => {
      const reference = commandSignature(POSE_PATHS.neutral[layer])
      for (const pose of POSE_IDS) {
        expect(commandSignature(POSE_PATHS[pose][layer])).toBe(reference)
        expect(RAW_SHAPES[pose][layer]).toEqual(POSE_SHAPES[pose][layer])
      }
    }
  )
})

describe("normalized shapes", () => {
  it.each(TAI_LAYERS)("layer %s has one vertex count in all poses", (layer) => {
    for (const pose of POSE_IDS) {
      expect(POSE_SHAPES[pose][layer].length).toBe(
        POSE_SHAPES.neutral[layer].length
      )
    }
  })

  it("keeps every original anchor and the exact drawn bounds", () => {
    for (const pose of POSE_IDS) {
      for (const layer of SOURCE_MISMATCHED_LAYERS) {
        const raw = RAW_SHAPES[pose][layer]
        const fixed = POSE_SHAPES[pose][layer]
        const a = pathBounds(raw)
        const b = pathBounds(fixed)
        expect(b.minX).toBeCloseTo(a.minX, 6)
        expect(b.maxX).toBeCloseTo(a.maxX, 6)
        expect(b.minY).toBeCloseTo(a.minY, 6)
        expect(b.maxY).toBeCloseTo(a.maxY, 6)
        expect(fixed.slice(0, 2)).toEqual(raw.slice(0, 2))
        expect(fixed.slice(-2)).toEqual(raw.slice(-2))
      }
    }
  })
})

describe("computeOffsets", () => {
  it("aligns the body bottom and the body horizontal center to the reference", () => {
    const offsets = computeOffsets(POSE_SHAPES, "neutral")
    expect(offsets.neutral).toEqual([0, 0])
    const ref = pathBounds(POSE_SHAPES.neutral.body)
    for (const pose of POSE_IDS) {
      const b = pathBounds(POSE_SHAPES[pose].body)
      const [dx, dy] = offsets[pose]
      expect(b.maxY + dy).toBeCloseTo(ref.maxY, 6)
      expect((b.minX + b.maxX) / 2 + dx).toBeCloseTo(
        (ref.minX + ref.maxX) / 2,
        6
      )
    }
  })

  it("is exported precomputed for the real poses", () => {
    expect(POSE_OFFSETS).toEqual(computeOffsets(POSE_SHAPES, "neutral"))
  })
})

describe("shared frame", () => {
  it("contains every translated layer of every pose", () => {
    const [x, y, w, h] = TAI_VIEW_BOX.split(" ").map(Number)
    for (const pose of POSE_IDS) {
      const [dx, dy] = POSE_OFFSETS[pose]
      for (const layer of TAI_LAYERS) {
        const b = pathBounds(POSE_SHAPES[pose][layer])
        expect(b.minX + dx).toBeGreaterThanOrEqual(x)
        expect(b.maxX + dx).toBeLessThanOrEqual(x + w)
        expect(b.minY + dy).toBeGreaterThanOrEqual(y)
        expect(b.maxY + dy).toBeLessThanOrEqual(y + h)
      }
    }
  })
})

describe("paints", () => {
  it("uses the documented colors", () => {
    expect(POSE_PAINTS.neutral.fills.panza).toBe("#FEDFC8")
    expect(POSE_PAINTS.neutral.fills.tail).toBe("#FF1727")
    expect(POSE_PAINTS.cold.fills.upperFin).toBe("#1C2A89")
    expect(POSE_PAINTS.cold.fills.secondUpperFin).toBe("#952756")
    expect(POSE_PAINTS.cold.bodyStops).toEqual([
      "#1C2A89",
      "#952756",
      "#FF1727",
    ])
  })

  it("is solid red on the body for every non-cold pose", () => {
    for (const pose of ["neutral", "sleep", "sad"] as const) {
      expect(POSE_PAINTS[pose].bodyStops).toEqual([
        "#FF1727",
        "#FF1727",
        "#FF1727",
      ])
    }
  })
})
