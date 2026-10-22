import { describe, expect, it } from "vitest"
import type { ActivityMovement } from "@/types/stats.types"
import {
  addDays,
  bucketByLocalDay,
  countLast7LocalDays,
  dayKey,
} from "./activity-dates"

const MX = "America/Mexico_City"
const NY = "America/New_York"

const mv = (
  occurredAt: string,
  kind: "new" | "advance" = "new"
): ActivityMovement => ({
  occurredAt,
  kind,
})

describe("dayKey", () => {
  it("puts a late-evening UTC-6 instant on the local day, not the UTC day", () => {
    // 21:00 local on the 20th is 03:00Z on the 21st.
    expect(dayKey("2026-10-21T03:30:00Z", MX)).toBe("2026-10-20")
  })

  it("flips exactly at local midnight (06:00Z in UTC-6)", () => {
    expect(dayKey("2026-10-21T05:59:59Z", MX)).toBe("2026-10-20")
    expect(dayKey("2026-10-21T06:00:00Z", MX)).toBe("2026-10-21")
  })

  it("accepts Date and epoch inputs", () => {
    const iso = "2026-10-21T12:00:00Z"
    expect(dayKey(new Date(iso), MX)).toBe("2026-10-21")
    expect(dayKey(Date.parse(iso), MX)).toBe("2026-10-21")
  })

  it("handles the 23-hour spring-forward day in New York (2026-03-08)", () => {
    expect(dayKey("2026-03-08T04:59:59Z", NY)).toBe("2026-03-07")
    expect(dayKey("2026-03-08T05:00:00Z", NY)).toBe("2026-03-08")
    expect(dayKey("2026-03-09T03:59:59Z", NY)).toBe("2026-03-08")
    expect(dayKey("2026-03-09T04:00:00Z", NY)).toBe("2026-03-09")
  })

  it("handles the 25-hour fall-back day in New York (2026-11-01)", () => {
    expect(dayKey("2026-11-01T03:59:59Z", NY)).toBe("2026-10-31")
    expect(dayKey("2026-11-01T04:00:00Z", NY)).toBe("2026-11-01")
    expect(dayKey("2026-11-02T04:59:59Z", NY)).toBe("2026-11-01")
    expect(dayKey("2026-11-02T05:00:00Z", NY)).toBe("2026-11-02")
  })
})

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01")
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28")
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31")
  })

  it("handles leap days", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29")
    expect(addDays("2028-02-29", 1)).toBe("2028-03-01")
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01")
    expect(addDays("2028-03-01", -1)).toBe("2028-02-29")
  })

  it("adds zero and large offsets", () => {
    expect(addDays("2026-10-21", 0)).toBe("2026-10-21")
    expect(addDays("2026-10-21", 100)).toBe("2027-01-29")
    expect(addDays("2026-10-21", -92)).toBe("2026-07-21")
  })
})

describe("bucketByLocalDay", () => {
  it("separates new from advance on the same local day", () => {
    const buckets = bucketByLocalDay(
      [
        mv("2026-10-20T15:00:00Z", "new"),
        mv("2026-10-20T16:00:00Z", "new"),
        mv("2026-10-20T17:00:00Z", "advance"),
      ],
      MX
    )
    expect(buckets.get("2026-10-20")).toEqual({ newCount: 2, advanceCount: 1 })
    expect(buckets.size).toBe(1)
  })

  it("groups by the local day", () => {
    const buckets = bucketByLocalDay(
      [mv("2026-10-21T03:30:00Z"), mv("2026-10-21T06:30:00Z", "advance")],
      MX
    )
    expect(buckets.get("2026-10-20")).toEqual({ newCount: 1, advanceCount: 0 })
    expect(buckets.get("2026-10-21")).toEqual({ newCount: 0, advanceCount: 1 })
  })

  it("is empty for no movements", () => {
    expect(bucketByLocalDay([], MX).size).toBe(0)
  })
})

describe("countLast7LocalDays", () => {
  // 18:00Z is noon in Mexico City: today is 2026-10-21, window 10-15..10-21.
  const now = new Date("2026-10-21T18:00:00Z")

  it("includes today-6 and excludes today-7", () => {
    expect(countLast7LocalDays([mv("2026-10-15T06:00:00Z")], now, MX)).toBe(1)
    expect(countLast7LocalDays([mv("2026-10-15T05:59:59Z")], now, MX)).toBe(0)
  })

  it("includes today", () => {
    expect(countLast7LocalDays([mv("2026-10-21T07:00:00Z")], now, MX)).toBe(1)
  })

  it("excludes days after today", () => {
    expect(countLast7LocalDays([mv("2026-10-22T06:00:00Z")], now, MX)).toBe(0)
  })

  it("counts new only by default", () => {
    const movements = [
      mv("2026-10-20T15:00:00Z", "new"),
      mv("2026-10-20T16:00:00Z", "advance"),
    ]
    expect(countLast7LocalDays(movements, now, MX)).toBe(1)
    expect(countLast7LocalDays(movements, now, MX, "advance")).toBe(1)
  })

  it("is 0 for no movements", () => {
    expect(countLast7LocalDays([], now, MX)).toBe(0)
  })

  it("uses the local day of now, not the UTC day", () => {
    // 03:30Z on the 22nd is still the 21st in Mexico City: window 10-15..10-21.
    const lateNow = new Date("2026-10-22T03:30:00Z")
    expect(countLast7LocalDays([mv("2026-10-15T06:00:00Z")], lateNow, MX)).toBe(
      1
    )
  })
})
