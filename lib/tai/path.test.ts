import { describe, expect, it } from "vitest"

import {
  commandSignature,
  lerpShape,
  parsePath,
  matchSegments,
  pathBounds,
  serializePath,
  splitSegment,
} from "./path"

describe("parsePath", () => {
  it("parses a closed M/C/Z path into a flat number array", () => {
    expect(parsePath("M0 0C1 2 3 4 5 6C7 8 9 10 11 12Z")).toEqual([
      0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
  })

  it("handles negatives and glued numbers", () => {
    const shape = parsePath(
      "M-0.964216 143.468C-3.964 135.468 16.259 115.968 24.536 115.968Z"
    )
    expect(shape[0]).toBeCloseTo(-0.964216)
    expect(shape[2]).toBeCloseTo(-3.964)
  })

  it("rejects commands other than M, C and Z", () => {
    expect(() => parsePath("M0 0L1 1Z")).toThrow()
    expect(() => parsePath("M0 0C1 2 3 4 5 6")).toThrow()
  })
})

describe("commandSignature", () => {
  it("encodes the command sequence", () => {
    expect(commandSignature("M0 0C1 2 3 4 5 6C7 8 9 10 11 12Z")).toBe("MCCZ")
  })
})

describe("serializePath", () => {
  it("round-trips through parsePath", () => {
    const shape = [0, 0, 1, 2, 3, 4, 5, 6]
    expect(parsePath(serializePath(shape))).toEqual(shape)
  })
})

describe("lerpShape", () => {
  it("returns the endpoints at t = 0 and t = 1 and the middle at 0.5", () => {
    const a = [0, 0, 10, 10]
    const b = [10, 20, 20, 30]
    expect(lerpShape(a, b, 0)).toEqual(a)
    expect(lerpShape(a, b, 1)).toEqual(b)
    expect(lerpShape(a, b, 0.5)).toEqual([5, 10, 15, 20])
  })

  it("writes into the provided buffer", () => {
    const out = [0, 0]
    expect(lerpShape([0, 0], [2, 4], 0.5, out)).toBe(out)
    expect(out).toEqual([1, 2])
  })
})

describe("pathBounds", () => {
  it("bounds a cubic by its on-curve extrema, not its control points", () => {
    // Control points reach y = 100, the curve itself peaks at 75.
    const bounds = pathBounds([0, 0, 0, 100, 100, 100, 100, 0])
    expect(bounds.minX).toBeCloseTo(0)
    expect(bounds.maxX).toBeCloseTo(100)
    expect(bounds.minY).toBeCloseTo(0)
    expect(bounds.maxY).toBeCloseTo(75)
  })
})

describe("splitSegment", () => {
  const curve = [0, 0, 0, 100, 100, 100, 100, 0]

  it("adds exactly one cubic segment", () => {
    expect(splitSegment(curve, 0).length).toBe(curve.length + 6)
  })

  it("keeps the drawn curve: same endpoints and same bounds", () => {
    const split = splitSegment(curve, 0)
    expect(split.slice(0, 2)).toEqual([0, 0])
    expect(split.slice(-2)).toEqual([100, 0])
    const a = pathBounds(curve)
    const b = pathBounds(split)
    expect(b.minX).toBeCloseTo(a.minX)
    expect(b.maxX).toBeCloseTo(a.maxX)
    expect(b.minY).toBeCloseTo(a.minY)
    expect(b.maxY).toBeCloseTo(a.maxY)
  })

  it("places the new anchor on the curve at t = 0.5", () => {
    const split = splitSegment(curve, 0)
    expect(split[6]).toBeCloseTo(50)
    expect(split[7]).toBeCloseTo(75)
  })
})

describe("matchSegments", () => {
  const short = [0, 0, 0, 10, 10, 10, 10, 0, 10, -10, 0, -10, 0, 0]
  // Same outline with an extra anchor near the left edge, shifted by nothing.
  const reference = [
    0, 0, 0, 10, 10, 10, 10, 0, 10, -5, 5, -10, 5, -10, 3, -10, 0, -10, 0, 0,
  ]

  it("returns the shape untouched when counts already match", () => {
    expect(matchSegments(short, short)).toEqual(short)
  })

  it("subdivides until the vertex count matches the reference", () => {
    expect(matchSegments(short, reference).length).toBe(reference.length)
  })

  it("keeps the drawn curve", () => {
    const a = pathBounds(short)
    const b = pathBounds(matchSegments(short, reference))
    expect(b.minX).toBeCloseTo(a.minX)
    expect(b.maxY).toBeCloseTo(a.maxY)
    expect(b.minY).toBeCloseTo(a.minY)
  })

  it("splits the segment that best lines up with the reference anchors", () => {
    // The reference has an extra anchor on its second segment (x = 5, y = -10),
    // so the second segment of the short shape is the one to split.
    const matched = matchSegments(short, reference)
    const split = splitSegment(short, 1)
    expect(matched).toEqual(split)
  })

  it("never removes segments", () => {
    expect(() => matchSegments(reference, short)).toThrow()
  })
})
