import type { ActivityMovement } from "@/types/stats.types"
import { addDays, bucketByLocalDay, dayKey } from "./activity-dates"

// Pure builders for the activity chart and heatmap. Counts are RAW (uncapped);
// the cap only applies when laying out squares (layoutDaySlots).

export interface ChartDay {
  date: string
  newCount: number
  advanceCount: number
}

export type SlotKind = "new" | "advance"

export interface DaySlots {
  squares: SlotKind[]
  overflow: number
}

export type HeatLevel = 0 | 1 | 2 | 3 | 4

// A past day (up to and including today) carries a count; a later day of the
// current month is "future" and carries none.
export type MonthCell =
  | { date: string; future: false; count: number }
  | { date: string; future: true }

export interface MonthGrid {
  // "yyyy-MM"
  month: string
  // Monday-first weeks of 7; null pads days outside the month.
  weeks: (MonthCell | null)[][]
}

export const CHART_DAYS = 14
export const DEFAULT_SLOT_CAP = 5
const HEATMAP_MONTHS = 3

export const build14DayChart = (
  movements: readonly ActivityMovement[],
  now: Date,
  timeZone: string
): ChartDay[] => {
  const buckets = bucketByLocalDay(movements, timeZone)
  const today = dayKey(now, timeZone)
  return Array.from({ length: CHART_DAYS }, (_, index) => {
    const date = addDays(today, index - (CHART_DAYS - 1))
    const bucket = buckets.get(date)
    return {
      date,
      newCount: bucket?.newCount ?? 0,
      advanceCount: bucket?.advanceCount ?? 0,
    }
  })
}

// Up to `cap` slots per day. Over the cap: `cap - 1` squares plus "+N" in the
// last slot (N = total - (cap - 1)). New squares come first (bottom of the
// column), advances above them.
export const layoutDaySlots = (
  newCount: number,
  advanceCount: number,
  cap: number = DEFAULT_SLOT_CAP
): DaySlots => {
  const total = newCount + advanceCount
  const ordered: SlotKind[] = [
    ...Array<SlotKind>(newCount).fill("new"),
    ...Array<SlotKind>(advanceCount).fill("advance"),
  ]
  if (total <= cap) return { squares: ordered, overflow: 0 }
  const visible = Math.max(0, cap - 1)
  return { squares: ordered.slice(0, visible), overflow: total - visible }
}

// Absolute heat level (no max): 0, 1, 2, 3-4, 5+ -> 0, 1, 2, 3, 4.
export const heatLevel = (count: number): HeatLevel => {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

const pad = (value: number) => String(value).padStart(2, "0")

// The current local month and the two before it, oldest first.
export const buildMonthGrid = (
  movements: readonly ActivityMovement[],
  now: Date,
  timeZone: string
): MonthGrid[] => {
  const buckets = bucketByLocalDay(movements, timeZone)
  const today = dayKey(now, timeZone)
  const [todayYear, todayMonth] = today.split("-").map(Number)

  return Array.from({ length: HEATMAP_MONTHS }, (_, index) => {
    const offset = index - (HEATMAP_MONTHS - 1)
    const first = new Date(Date.UTC(todayYear, todayMonth - 1 + offset, 1))
    const year = first.getUTCFullYear()
    const month = first.getUTCMonth() + 1
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
    // getUTCDay(): 0 = Sunday. Shift so Monday = 0.
    const leading = (first.getUTCDay() + 6) % 7

    const slots: (MonthCell | null)[] = Array(leading).fill(null)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${pad(month)}-${pad(day)}`
      if (date > today) {
        slots.push({ date, future: true })
      } else {
        const bucket = buckets.get(date)
        slots.push({
          date,
          future: false,
          count: (bucket?.newCount ?? 0) + (bucket?.advanceCount ?? 0),
        })
      }
    }
    while (slots.length % 7 !== 0) slots.push(null)

    const weeks: (MonthCell | null)[][] = []
    for (let i = 0; i < slots.length; i += 7) weeks.push(slots.slice(i, i + 7))
    return { month: `${year}-${pad(month)}`, weeks }
  })
}
