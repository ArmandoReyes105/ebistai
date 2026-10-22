import { addDays, dayKey } from "./activity-dates"

// Spanish display helpers for the dashboard. Pure: they take explicit
// "yyyy-MM-dd" keys, or an instant plus an IANA zone and an injected `now`.
// Month and weekday names are fixed tables (not Intl) so the output never
// depends on the ICU data of the runtime.

const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
]

const WEEKDAYS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
]

// Sunday first, like Date#getUTCDay().
const WEEKDAY_INITIALS = ["D", "L", "M", "X", "J", "V", "S"]

const parseKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number)
  return { year, month, day }
}

const weekdayIndex = (key: string): number => {
  const { year, month, day } = parseKey(key)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

// "Martes 20 oct · 2026" for the local day of `now`.
export const formatHeaderDate = (now: Date, timeZone: string): string => {
  const key = dayKey(now, timeZone)
  const { year, month, day } = parseKey(key)
  return `${capitalize(WEEKDAYS[weekdayIndex(key)])} ${day} ${MONTHS_SHORT[month - 1]} · ${year}`
}

// "04 oct"
export const formatShortDate = (key: string): string => {
  const { month, day } = parseKey(key)
  return `${String(day).padStart(2, "0")} ${MONTHS_SHORT[month - 1]}`
}

export const weekdayInitial = (key: string): string =>
  WEEKDAY_INITIALS[weekdayIndex(key)]

// "2026-08" -> "Ago"
export const monthLabel = (monthKey: string): string => {
  const [, month] = monthKey.split("-").map(Number)
  return capitalize(MONTHS_SHORT[month - 1])
}

// Calendar days from `from` to `to` (negative when `to` is earlier).
export const daysBetweenKeys = (from: string, to: string): number => {
  const a = parseKey(from)
  const b = parseKey(to)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) -
      Date.UTC(a.year, a.month - 1, a.day)) /
      msPerDay
  )
}

// Whole local calendar days since the instant; 0 for an instant in the future.
export const daysSinceInstant = (
  instant: string | number | Date,
  now: Date,
  timeZone: string
): number =>
  Math.max(0, daysBetweenKeys(dayKey(instant, timeZone), dayKey(now, timeZone)))

// "Hoy" / "Ayer" / "18 oct" for the feed.
export const formatActivityWhen = (
  instant: string | number | Date,
  now: Date,
  timeZone: string
): string => {
  const key = dayKey(instant, timeZone)
  const today = dayKey(now, timeZone)
  if (key === today) return "Hoy"
  if (key === addDays(today, -1)) return "Ayer"
  return formatShortDate(key)
}

// Chart column label (aria-label and tooltip): exact, uncapped counts.
export const describeDayCounts = (
  key: string,
  newCount: number,
  advanceCount: number
): string =>
  `${formatShortDate(key)} · ${plural(newCount, "postulación nueva", "postulaciones nuevas")}, ${plural(advanceCount, "avance", "avances")}`

// Heatmap cell label (aria-label and tooltip).
export const describeHeatCell = (key: string, count: number): string =>
  `${formatShortDate(key)} · ${plural(count, "movimiento", "movimientos")}`
