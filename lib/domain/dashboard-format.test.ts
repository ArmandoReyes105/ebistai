import { describe, expect, it } from "vitest"
import {
  daysBetweenKeys,
  daysSinceInstant,
  describeDayCounts,
  describeHeatCell,
  formatActivityWhen,
  formatHeaderDate,
  formatShortDate,
  monthLabel,
  weekdayInitial,
} from "./dashboard-format"

const MEXICO = "America/Mexico_City"

describe("formatHeaderDate", () => {
  it("uses the local day, not the UTC day (21:30 local is already the next UTC day)", () => {
    const now = new Date("2026-10-21T03:30:00Z")
    expect(formatHeaderDate(now, MEXICO)).toBe("Martes 20 oct · 2026")
    expect(formatHeaderDate(now, "UTC")).toBe("Miércoles 21 oct · 2026")
  })

  it("does not pad the day of the month", () => {
    expect(formatHeaderDate(new Date("2026-03-05T18:00:00Z"), "UTC")).toBe(
      "Jueves 5 mar · 2026"
    )
  })
})

describe("formatShortDate", () => {
  it("pads the day and abbreviates the month in Spanish", () => {
    expect(formatShortDate("2026-09-04")).toBe("04 sep")
    expect(formatShortDate("2026-12-31")).toBe("31 dic")
    expect(formatShortDate("2026-01-01")).toBe("01 ene")
  })
})

describe("weekdayInitial", () => {
  it("returns the Spanish single-letter weekday, Sunday = D", () => {
    expect(weekdayInitial("2026-10-18")).toBe("D")
    expect(weekdayInitial("2026-10-19")).toBe("L")
    expect(weekdayInitial("2026-10-20")).toBe("M")
    expect(weekdayInitial("2026-10-21")).toBe("X")
    expect(weekdayInitial("2026-10-22")).toBe("J")
    expect(weekdayInitial("2026-10-23")).toBe("V")
    expect(weekdayInitial("2026-10-24")).toBe("S")
  })
})

describe("monthLabel", () => {
  it("capitalizes the Spanish short month of a yyyy-MM key", () => {
    expect(monthLabel("2026-08")).toBe("Ago")
    expect(monthLabel("2026-10")).toBe("Oct")
  })
})

describe("daysBetweenKeys", () => {
  it("counts calendar days across months, years and leap days", () => {
    expect(daysBetweenKeys("2026-09-29", "2026-10-20")).toBe(21)
    expect(daysBetweenKeys("2025-12-31", "2026-01-01")).toBe(1)
    expect(daysBetweenKeys("2028-02-28", "2028-03-01")).toBe(2)
    expect(daysBetweenKeys("2026-10-20", "2026-10-20")).toBe(0)
    expect(daysBetweenKeys("2026-10-20", "2026-10-18")).toBe(-2)
  })
})

describe("daysSinceInstant", () => {
  const now = new Date("2026-10-20T18:00:00Z")

  it("counts whole local calendar days", () => {
    expect(daysSinceInstant("2026-09-29T12:00:00Z", now, "UTC")).toBe(21)
  })

  it("uses the local day of both instants", () => {
    // 03:00Z on the 29th is still the 28th at UTC-6.
    expect(daysSinceInstant("2026-09-29T03:00:00Z", now, MEXICO)).toBe(22)
  })

  it("never goes below zero for an instant later than now", () => {
    expect(daysSinceInstant("2026-10-22T12:00:00Z", now, "UTC")).toBe(0)
  })
})

describe("formatActivityWhen", () => {
  const now = new Date("2026-10-20T18:00:00Z")

  it("says Hoy for the same local day and Ayer for the previous one", () => {
    expect(formatActivityWhen("2026-10-20T01:00:00Z", now, "UTC")).toBe("Hoy")
    expect(formatActivityWhen("2026-10-19T23:59:00Z", now, "UTC")).toBe("Ayer")
  })

  it("falls back to the short date for older events", () => {
    expect(formatActivityWhen("2026-10-18T12:00:00Z", now, "UTC")).toBe(
      "18 oct"
    )
  })

  it("resolves the day in the given zone (late evening stays on its local day)", () => {
    // 03:00Z on the 21st is 21:00 on the 20th at UTC-6: today for `now`.
    expect(formatActivityWhen("2026-10-21T03:00:00Z", now, MEXICO)).toBe("Hoy")
  })
})

describe("describeDayCounts", () => {
  it("lists exact new and advance counts with Spanish plurals", () => {
    expect(describeDayCounts("2026-10-20", 2, 1)).toBe(
      "20 oct · 2 postulaciones nuevas, 1 avance"
    )
    expect(describeDayCounts("2026-10-20", 1, 3)).toBe(
      "20 oct · 1 postulación nueva, 3 avances"
    )
    expect(describeDayCounts("2026-10-07", 0, 0)).toBe(
      "07 oct · 0 postulaciones nuevas, 0 avances"
    )
  })
})

describe("describeHeatCell", () => {
  it("states the date and the exact movement count", () => {
    expect(describeHeatCell("2026-10-20", 3)).toBe("20 oct · 3 movimientos")
    expect(describeHeatCell("2026-10-20", 1)).toBe("20 oct · 1 movimiento")
    expect(describeHeatCell("2026-10-20", 0)).toBe("20 oct · 0 movimientos")
  })
})
