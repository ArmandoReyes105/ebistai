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
  it("is 30 for thresholds up to 30", () => {
    expect(scaleDays(7)).toBe(30)
    expect(scaleDays(30)).toBe(30)
  })

  it("follows the threshold above 30", () => {
    expect(scaleDays(45)).toBe(45)
  })
})

describe("barPercent", () => {
  it("scales days against 30 when the threshold is small", () => {
    expect(barPercent(15, 14)).toBe(50)
  })

  it("scales against the threshold when it is above 30", () => {
    expect(barPercent(30, 60)).toBe(50)
  })

  it("clamps to 0..100", () => {
    expect(barPercent(90, 14)).toBe(100)
    expect(barPercent(-3, 14)).toBe(0)
    expect(barPercent(0, 14)).toBe(0)
  })
})

describe("thresholdPercent", () => {
  it("places a small threshold against the 30-day scale", () => {
    expect(thresholdPercent(15)).toBe(50)
    expect(thresholdPercent(30)).toBe(100)
  })

  it("is 100 when the threshold is above 30 (it defines the scale)", () => {
    expect(thresholdPercent(45)).toBe(100)
  })

  it("clamps negative thresholds to 0", () => {
    expect(thresholdPercent(-5)).toBe(0)
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
