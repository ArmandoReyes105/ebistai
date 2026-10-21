import { ApplicationEvent } from "@/types/job-application.types"

const DAY_MS = 24 * 60 * 60 * 1000

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()

// Whole calendar days between two dates, ignoring the time of day.
export const daysBetween = (from: Date, to: Date) =>
  Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS)

// "1 día" / "5 días"
export const pluralDays = (days: number) =>
  days === 1 ? "1 día" : `${days} días`

// Date of the most recent event, or `fallback` when there is none newer.
export const lastEventDate = (
  events: ApplicationEvent[],
  fallback: Date
): Date =>
  events.reduce((latest, event) => {
    const date = new Date(event.occurredAt)
    return date > latest ? date : latest
  }, fallback)
