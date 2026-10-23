import { describe, expect, it } from "vitest"
import {
  barPercent,
  formatRate,
  formatResponseSummary,
  formatResponseTime,
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

describe("formatRate", () => {
  it("returns null when there is no rate (the line is omitted)", () => {
    expect(formatRate(null)).toBeNull()
  })

  it("returns the integer percent without a symbol", () => {
    expect(formatRate(62)).toBe(62)
    expect(formatRate(0)).toBe(0)
  })
})

describe("formatResponseSummary", () => {
  it("emphasizes the counts and uses plural forms for several applications", () => {
    expect(formatResponseSummary(10, 29)).toEqual({
      before: "",
      strong: "10 de 29 postulaciones",
      after: " te han respondido.",
    })
  })

  it("uses the singular noun when there is one application", () => {
    expect(formatResponseSummary(1, 1)).toEqual({
      before: "",
      strong: "1 de 1 postulación",
      after: " te ha respondido.",
    })
    expect(formatResponseSummary(0, 1)).toEqual({
      before: "",
      strong: "0 de 1 postulación",
      after: " te han respondido.",
    })
  })

  it("uses the singular verb when exactly one responded", () => {
    expect(formatResponseSummary(1, 5).after).toBe(" te ha respondido.")
  })

  it("uses the plural verb when none responded", () => {
    expect(formatResponseSummary(0, 4).after).toBe(" te han respondido.")
  })
})

describe("formatResponseTime", () => {
  it("is null when there is no median yet", () => {
    expect(formatResponseTime(null)).toBeNull()
  })

  it("emphasizes the median rounded to whole days", () => {
    expect(formatResponseTime(6.4)).toEqual({
      before: "Las empresas suelen tardar ",
      strong: "6 días",
      after: " en responderte.",
    })
  })

  it("uses the singular for one day", () => {
    expect(formatResponseTime(1.2)?.strong).toBe("1 día")
  })

  it("says the same day when the median rounds to zero", () => {
    expect(formatResponseTime(0.3)).toEqual({
      before: "Las empresas suelen responderte ",
      strong: "el mismo día",
      after: ".",
    })
  })
})
