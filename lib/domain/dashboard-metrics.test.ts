import { describe, expect, it } from "vitest"
import {
  barPercent,
  formatMedian,
  formatRate,
  pct,
  scaleDays,
  thresholdPercent,
} from "./dashboard-metrics"

describe("scaleDays", () => {
  it("is the oldest application's days when it passes the threshold", () => {
    expect(scaleDays(14, 78)).toBe(78)
  })

  it("is the threshold when nothing passes it (the tick stays in range)", () => {
    expect(scaleDays(14, 0)).toBe(14)
    expect(scaleDays(14, 10)).toBe(14)
  })

  it("is never below 1 (never divides by 0)", () => {
    expect(scaleDays(0, 0)).toBe(1)
    expect(scaleDays(-5, -3)).toBe(1)
  })
})

describe("barPercent", () => {
  it("fills the oldest application completely", () => {
    expect(barPercent(78, 78)).toBe(100)
  })

  it("scales the others against the oldest", () => {
    expect(barPercent(39, 78)).toBe(50)
  })

  it("clamps to 0..100", () => {
    expect(barPercent(90, 78)).toBe(100)
    expect(barPercent(-3, 78)).toBe(0)
    expect(barPercent(0, 78)).toBe(0)
  })
})

describe("thresholdPercent", () => {
  it("places the threshold against the scale", () => {
    expect(thresholdPercent(14, 28)).toBe(50)
  })

  it("is 100 when the threshold defines the scale", () => {
    expect(thresholdPercent(14, 14)).toBe(100)
  })

  it("clamps negative thresholds to 0", () => {
    expect(thresholdPercent(-5, 30)).toBe(0)
  })
})

describe("pct", () => {
  it("is 0 when the total is 0 (never NaN)", () => {
    expect(pct(0, 0)).toBe(0)
    expect(pct(3, 0)).toBe(0)
  })

  it("rounds to an integer, midpoints away from zero", () => {
    expect(pct(1, 3)).toBe(33)
    expect(pct(2, 3)).toBe(67)
    expect(pct(1, 8)).toBe(13)
    expect(pct(5, 5)).toBe(100)
  })
})

describe("formatMedian", () => {
  it("shows an em dash when there is no median", () => {
    expect(formatMedian(null)).toBe("—")
  })

  it("rounds the API's 1-decimal value to an integer", () => {
    expect(formatMedian(4.4)).toBe("4")
    expect(formatMedian(4.5)).toBe("5")
    expect(formatMedian(0)).toBe("0")
  })
})

describe("formatRate", () => {
  it("returns null when there is no rate (the line is omitted)", () => {
    expect(formatRate(null)).toBeNull()
  })

  it("returns the integer percent without a symbol", () => {
    expect(formatRate(62)).toBe(62)
    expect(formatRate(0)).toBe(0)
  })
})
