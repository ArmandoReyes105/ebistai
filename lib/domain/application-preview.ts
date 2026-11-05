import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"

const DATE_FORMAT = "d MMM yyyy"

// The letter of the block that stands for the company.
export function previewInitial(company: string): string {
  const [first] = company.trim()
  return (first ?? "E").toUpperCase()
}

// An application without a chosen date is saved with today's date, so the form
// says so instead of showing an empty field.
export function formatAppliedDate(
  value: Date | "" | undefined,
  now: Date = new Date()
): string {
  const date = value || now
  const text = format(date, DATE_FORMAT, { locale: es })
  return isSameDay(date, now) ? `Hoy, ${text}` : text
}
