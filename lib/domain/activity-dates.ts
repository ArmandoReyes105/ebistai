import type { ActivityMovement, MovementKind } from "@/types/stats.types"

// Local-day helpers for the activity widgets. Pure: every function takes an
// explicit IANA `timeZone` and an injected `now`; nothing reads the clock.

export interface DayCounts {
  newCount: number
  advanceCount: number
}

const formatters = new Map<string, Intl.DateTimeFormat>()

const formatterFor = (timeZone: string): Intl.DateTimeFormat => {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    formatters.set(timeZone, formatter)
  }
  return formatter
}

// "yyyy-MM-dd" of the instant in the given zone.
export const dayKey = (
  instant: string | number | Date,
  timeZone: string
): string => {
  const parts = formatterFor(timeZone).formatToParts(new Date(instant))
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ""
  return `${get("year")}-${get("month")}-${get("day")}`
}

// Calendar arithmetic on a "yyyy-MM-dd" key. Done in UTC y-m-d so DST
// transitions (23h and 25h days) can never skip or repeat a day.
export const addDays = (key: string, days: number): string => {
  const [year, month, day] = key.split("-").map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

export const bucketByLocalDay = (
  movements: readonly ActivityMovement[],
  timeZone: string
): Map<string, DayCounts> => {
  const buckets = new Map<string, DayCounts>()
  for (const movement of movements) {
    const key = dayKey(movement.occurredAt, timeZone)
    const bucket = buckets.get(key) ?? { newCount: 0, advanceCount: 0 }
    if (movement.kind === "new") bucket.newCount += 1
    else bucket.advanceCount += 1
    buckets.set(key, bucket)
  }
  return buckets
}

// Movements of `kind` whose local day is within [today-6, today].
export const countLast7LocalDays = (
  movements: readonly ActivityMovement[],
  now: Date,
  timeZone: string,
  kind: MovementKind = "new"
): number => {
  const today = dayKey(now, timeZone)
  const first = addDays(today, -6)
  // "yyyy-MM-dd" keys compare correctly as strings.
  return movements.filter((movement) => {
    if (movement.kind !== kind) return false
    const key = dayKey(movement.occurredAt, timeZone)
    return key >= first && key <= today
  }).length
}
