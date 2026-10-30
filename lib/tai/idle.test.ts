import { describe, expect, it } from "vitest"

import { idleKindFor, nextBlink, nextShiver, shiverFrames } from "./idle"
import { POSE_IDS } from "./types"

const seq = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length]
}

describe("nextBlink", () => {
  it("waits between 3 and 6 seconds", () => {
    expect(nextBlink(seq(0, 0)).delayMs).toBe(3000)
    expect(nextBlink(seq(0.5, 0)).delayMs).toBe(4500)
    expect(nextBlink(seq(0.999999, 0)).delayMs).toBeLessThan(6000)
  })

  it("is sometimes a double blink", () => {
    expect(nextBlink(seq(0.5, 0.1)).double).toBe(true)
    expect(nextBlink(seq(0.5, 0.9)).double).toBe(false)
  })
})

describe("nextShiver", () => {
  it("waits 2.5 to 5 s and lasts 300 to 450 ms", () => {
    const low = nextShiver(seq(0, 0))
    expect(low).toEqual({ delayMs: 2500, durationMs: 300 })
    const high = nextShiver(seq(0.999999, 0.999999))
    expect(high.delayMs).toBeLessThan(5000)
    expect(high.durationMs).toBeLessThan(450)
  })
})

describe("shiverFrames", () => {
  it("starts and ends at rest and alternates direction", () => {
    const frames = shiverFrames(1.6)
    expect(frames[0]).toEqual({ x: 0, rotate: 0 })
    expect(frames[frames.length - 1]).toEqual({ x: 0, rotate: 0 })
    const inner = frames.slice(1, -1)
    inner.forEach((f, i) => {
      if (i > 0) expect(Math.sign(f.x)).toBe(-Math.sign(inner[i - 1].x))
    })
  })

  it("never exceeds the amplitude and scales with it", () => {
    const frames = shiverFrames(2)
    expect(Math.max(...frames.map((f) => Math.abs(f.x)))).toBeLessThanOrEqual(2)
    expect(shiverFrames(0).every((f) => f.x === 0 && f.rotate === 0)).toBe(true)
  })
})

describe("idleKindFor", () => {
  it("only neutral, sleep and cold have idle motion", () => {
    expect(POSE_IDS.map(idleKindFor)).toEqual([
      "neutral",
      "sleep",
      "cold",
      "none",
    ])
  })
})
