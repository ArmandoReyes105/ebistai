import { describe, expect, it } from "vitest"

import { hexToRgb, lerpRgb, rgbToHex } from "./color"

describe("hexToRgb", () => {
  it("parses 6-digit hex, case-insensitive", () => {
    expect(hexToRgb("#FF1727")).toEqual([255, 23, 39])
    expect(hexToRgb("#1c2a89")).toEqual([28, 42, 137])
  })

  it("rejects malformed values", () => {
    expect(() => hexToRgb("red")).toThrow()
    expect(() => hexToRgb("#fff")).toThrow()
  })
})

describe("rgbToHex", () => {
  it("serializes, rounds and clamps channels", () => {
    expect(rgbToHex([255, 23, 39])).toBe("#ff1727")
    expect(rgbToHex([300, -4, 127.6])).toBe("#ff0080")
  })
})

describe("lerpRgb", () => {
  it("interpolates channel by channel", () => {
    expect(lerpRgb([0, 100, 200], [100, 200, 0], 0.5)).toEqual([50, 150, 100])
  })

  it("returns the endpoints at t = 0 and t = 1", () => {
    const a = hexToRgb("#FF1727")
    const b = hexToRgb("#1C2A89")
    expect(lerpRgb(a, b, 0)).toEqual(a)
    expect(lerpRgb(a, b, 1)).toEqual(b)
  })
})
