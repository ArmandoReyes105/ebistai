import { describe, expect, it } from "vitest"

import {
  DEFAULT_MORPH_MS,
  clamp01,
  easeInOutCubic,
  loopAmplitude,
  smoothstep,
  zOpacity,
} from "./motion"

describe("easing", () => {
  it("clamps to the unit interval", () => {
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(2)).toBe(1)
  })

  it("starts at 0, ends at 1 and is symmetric around the midpoint", () => {
    for (const ease of [easeInOutCubic, smoothstep]) {
      expect(ease(0)).toBe(0)
      expect(ease(1)).toBe(1)
      expect(ease(0.5)).toBeCloseTo(0.5)
    }
  })

  it("defaults the morph to 1100 ms", () => {
    expect(DEFAULT_MORPH_MS).toBe(1100)
  })
})

describe("loopAmplitude", () => {
  it("fades out from the start amplitude, is silent mid-morph, then fades in", () => {
    expect(loopAmplitude(0, 1)).toBe(1)
    expect(loopAmplitude(0, 0.4)).toBeCloseTo(0.4)
    expect(loopAmplitude(0.15, 1)).toBe(0)
    expect(loopAmplitude(0.5, 1)).toBe(0)
    expect(loopAmplitude(0.85, 1)).toBe(0)
    expect(loopAmplitude(1, 1)).toBe(1)
  })
})

describe("zOpacity", () => {
  it("appears late when falling asleep", () => {
    expect(zOpacity("sleep", 0.5, 0)).toBe(0)
    expect(zOpacity("sleep", 1, 0)).toBe(1)
  })

  it("vanishes early when waking", () => {
    expect(zOpacity("wake", 0, 1)).toBe(1)
    expect(zOpacity("wake", 0.25, 1)).toBe(0)
    expect(zOpacity("wake", 0.6, 0.5)).toBe(0)
  })
})
