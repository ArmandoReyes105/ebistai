import { describe, expect, it } from "vitest"
import { radarBarPercent, radarThresholdPercent } from "./landing-radar"

describe("radarBarPercent", () => {
  it("scales days against the 40 day track", () => {
    expect(radarBarPercent(20)).toBe(50)
    expect(radarBarPercent(31)).toBe(77.5)
  })

  it("caps the bar at the full track", () => {
    expect(radarBarPercent(40)).toBe(100)
    expect(radarBarPercent(90)).toBe(100)
  })

  it("never goes below zero or returns NaN", () => {
    expect(radarBarPercent(0)).toBe(0)
    expect(radarBarPercent(-3)).toBe(0)
    expect(radarBarPercent(Number.NaN)).toBe(0)
  })
})

describe("radarThresholdPercent", () => {
  it("places the default 14 day threshold at 35% of the track", () => {
    expect(radarThresholdPercent(14)).toBe(35)
  })

  it("keeps the marker inside the track", () => {
    expect(radarThresholdPercent(45)).toBe(100)
  })
})
