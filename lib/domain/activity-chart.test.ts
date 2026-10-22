import { describe, expect, it } from "vitest"
import type { ActivityMovement } from "@/types/stats.types"
import {
  buildMonthGrid,
  build14DayChart,
  heatLevel,
  layoutDaySlots,
  type MonthCell,
} from "./activity-chart"

const MX = "America/Mexico_City"
const NY = "America/New_York"

const mv = (
  occurredAt: string,
  kind: "new" | "advance" = "new"
): ActivityMovement => ({
  occurredAt,
  kind,
})

// Noon in Mexico City: today is 2026-10-21 (a Wednesday).
const now = new Date("2026-10-21T18:00:00Z")

const monthCells = (weeks: (MonthCell | null)[][]): MonthCell[] =>
  weeks.flat().filter((cell): cell is MonthCell => cell !== null)

describe("build14DayChart", () => {
  it("returns 14 ascending days ending today, zero-filled", () => {
    const chart = build14DayChart([], now, MX)
    expect(chart).toHaveLength(14)
    expect(chart[0].date).toBe("2026-10-08")
    expect(chart[13].date).toBe("2026-10-21")
    expect(
      chart.every((day) => day.newCount === 0 && day.advanceCount === 0)
    ).toBe(true)
  })

  it("counts new and advance per local day", () => {
    const chart = build14DayChart(
      [
        mv("2026-10-21T15:00:00Z", "new"),
        mv("2026-10-21T16:00:00Z", "new"),
        mv("2026-10-21T17:00:00Z", "advance"),
        mv("2026-10-20T15:00:00Z", "advance"),
      ],
      now,
      MX
    )
    expect(chart[13]).toEqual({
      date: "2026-10-21",
      newCount: 2,
      advanceCount: 1,
    })
    expect(chart[12]).toEqual({
      date: "2026-10-20",
      newCount: 0,
      advanceCount: 1,
    })
  })

  it("keeps the local-day midnight edges of the window", () => {
    const chart = build14DayChart(
      [
        mv("2026-10-08T06:00:00Z"), // 00:00 local on the oldest day: in
        mv("2026-10-08T05:59:59Z"), // 23:59:59 local the day before: out
        mv("2026-10-22T05:59:59Z"), // 23:59:59 local today: in
        mv("2026-10-22T06:00:00Z"), // tomorrow: out
      ],
      now,
      MX
    )
    expect(chart[0].newCount).toBe(1)
    expect(chart[13].newCount).toBe(1)
    expect(chart.reduce((sum, day) => sum + day.newCount, 0)).toBe(2)
  })

  it("still yields 14 distinct days across the DST spring-forward", () => {
    const nyNow = new Date("2026-03-10T16:00:00Z")
    const dates = build14DayChart([], nyNow, NY).map((day) => day.date)
    expect(new Set(dates).size).toBe(14)
    expect(dates[0]).toBe("2026-02-25")
    expect(dates[13]).toBe("2026-03-10")
    expect(dates).toContain("2026-03-08")
  })

  it("still yields 14 distinct days across the DST fall-back", () => {
    const nyNow = new Date("2026-11-03T16:00:00Z")
    const dates = build14DayChart([], nyNow, NY).map((day) => day.date)
    expect(new Set(dates).size).toBe(14)
    expect(dates).toContain("2026-11-01")
    expect(dates[13]).toBe("2026-11-03")
  })
})

describe("layoutDaySlots (cap 5)", () => {
  it("is empty for a day without movements", () => {
    expect(layoutDaySlots(0, 0)).toEqual({ squares: [], overflow: 0 })
  })

  it("draws 3 new squares", () => {
    expect(layoutDaySlots(3, 0)).toEqual({
      squares: ["new", "new", "new"],
      overflow: 0,
    })
  })

  it("puts new first (bottom) and advances after", () => {
    expect(layoutDaySlots(2, 2)).toEqual({
      squares: ["new", "new", "advance", "advance"],
      overflow: 0,
    })
  })

  it("shows all 5 squares at exactly the cap", () => {
    const layout = layoutDaySlots(3, 2)
    expect(layout.squares).toHaveLength(5)
    expect(layout.overflow).toBe(0)
  })

  it("shows 4 squares and +2 for 6", () => {
    expect(layoutDaySlots(6, 0)).toEqual({
      squares: ["new", "new", "new", "new"],
      overflow: 2,
    })
  })

  it("shows 4 squares and +8 for 12 new", () => {
    const layout = layoutDaySlots(12, 0)
    expect(layout.squares).toHaveLength(4)
    expect(layout.overflow).toBe(8)
  })

  it("keeps new first when truncating a mixed day", () => {
    expect(layoutDaySlots(2, 5)).toEqual({
      squares: ["new", "new", "advance", "advance"],
      overflow: 3,
    })
  })

  it("derives the squares from the cap", () => {
    expect(layoutDaySlots(3, 0, 3)).toEqual({
      squares: ["new", "new", "new"],
      overflow: 0,
    })
    expect(layoutDaySlots(4, 0, 3)).toEqual({
      squares: ["new", "new"],
      overflow: 2,
    })
    expect(layoutDaySlots(10, 0, 8).squares).toHaveLength(7)
    expect(layoutDaySlots(10, 0, 8).overflow).toBe(3)
  })
})

describe("heatLevel", () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 3],
    [5, 4],
    [50, 4],
  ])("count %i -> level %i", (count, level) => {
    expect(heatLevel(count)).toBe(level)
  })
})

describe("buildMonthGrid", () => {
  const grid = buildMonthGrid([], now, MX)

  it("returns the current month and the two previous, oldest first", () => {
    expect(grid.map((month) => month.month)).toEqual([
      "2026-08",
      "2026-09",
      "2026-10",
    ])
  })

  it("lays out Monday-first weeks of 7", () => {
    for (const month of grid) {
      expect(month.weeks.every((week) => week.length === 7)).toBe(true)
    }
    // 2026-10-01 is a Thursday: Mon-Wed are padding.
    const first = grid[2].weeks[0]
    expect(first.slice(0, 3)).toEqual([null, null, null])
    expect(first[3]?.date).toBe("2026-10-01")
  })

  it("has the right day count per month, February included", () => {
    expect(monthCells(grid[0].weeks)).toHaveLength(31)
    expect(monthCells(grid[1].weeks)).toHaveLength(30)
    expect(monthCells(grid[2].weeks)).toHaveLength(31)

    const feb = buildMonthGrid([], new Date("2026-02-10T18:00:00Z"), MX)
    expect(feb.map((month) => month.month)).toEqual([
      "2025-12",
      "2026-01",
      "2026-02",
    ])
    expect(monthCells(feb[2].weeks)).toHaveLength(28)
    // 2026-02-01 is a Sunday: six padding cells before it.
    expect(feb[2].weeks[0].slice(0, 6)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
    ])
    expect(feb[2].weeks[0][6]?.date).toBe("2026-02-01")
  })

  it("gives a leap February 29 days", () => {
    const leap = buildMonthGrid([], new Date("2028-02-10T18:00:00Z"), MX)
    expect(monthCells(leap[2].weeks)).toHaveLength(29)
  })

  it("marks days after today as future, without a count", () => {
    const future = monthCells(grid[2].weeks).filter((cell) => cell.future)
    expect(future).toHaveLength(10) // 22..31
    expect(future[0].date).toBe("2026-10-22")
    for (const cell of future) expect("count" in cell).toBe(false)
  })

  it("counts today and every past day with new + advance", () => {
    const withEvents = buildMonthGrid(
      [
        mv("2026-10-21T15:00:00Z", "new"),
        mv("2026-10-21T16:00:00Z", "advance"),
        mv("2026-10-20T15:00:00Z", "new"),
      ],
      now,
      MX
    )
    const october = monthCells(withEvents[2].weeks)
    expect(october.find((cell) => cell.date === "2026-10-21")).toEqual({
      date: "2026-10-21",
      future: false,
      count: 2,
    })
    expect(october.find((cell) => cell.date === "2026-10-20")).toEqual({
      date: "2026-10-20",
      future: false,
      count: 1,
    })
    expect(october.find((cell) => cell.date === "2026-10-02")).toEqual({
      date: "2026-10-02",
      future: false,
      count: 0,
    })
  })

  it("puts an event on the 1st of the oldest month in the oldest month", () => {
    const withEvent = buildMonthGrid([mv("2026-08-01T10:00:00Z")], now, MX)
    expect(monthCells(withEvent[0].weeks)[0]).toEqual({
      date: "2026-08-01",
      future: false,
      count: 1,
    })
  })

  it("does not count a movement dated after today", () => {
    const withFuture = buildMonthGrid([mv("2026-10-25T15:00:00Z")], now, MX)
    const october = monthCells(withFuture[2].weeks)
    expect(october.find((cell) => cell.date === "2026-10-25")).toEqual({
      date: "2026-10-25",
      future: true,
    })
  })

  it("rolls over the year boundary", () => {
    const jan = buildMonthGrid([], new Date("2026-01-15T18:00:00Z"), MX)
    expect(jan.map((month) => month.month)).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
    ])
  })
})
