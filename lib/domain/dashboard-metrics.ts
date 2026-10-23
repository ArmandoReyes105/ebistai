const clampPercent = (value: number): number =>
  Math.min(100, Math.max(0, value))

// The radar bar scale is relative: the oldest application fills the bar. It is
// never shorter than the threshold (so the tick stays in range) nor than 1.
export const scaleDays = (thresholdDays: number, oldestDays: number): number =>
  Math.max(1, thresholdDays, oldestDays)

// Width of a radar bar, 0..100.
export const barPercent = (days: number, scale: number): number =>
  clampPercent((days / scale) * 100)

// Position of the threshold tick on a radar bar, 0..100.
export const thresholdPercent = (thresholdDays: number, scale: number): number =>
  clampPercent((thresholdDays / scale) * 100)

// Integer percentage; 0 when there is nothing to divide by (never NaN).
export const pct = (count: number, total: number): number =>
  total <= 0 ? 0 : Math.round((count / total) * 100)

// Response rate as an integer percent, or null so the caller omits the line.
export const formatRate = (rate: number | null): number | null =>
  rate === null ? null : Math.round(rate)

// A sentence split around the part the UI renders in bold.
export interface EmphasizedText {
  before: string
  strong: string
  after: string
}

// Detail line under the all-time response rate: "**10 de 29 postulaciones** te han respondido.".
export const formatResponseSummary = (responded: number, total: number): EmphasizedText => {
  const noun = total === 1 ? "postulación" : "postulaciones"
  const verb = responded === 1 ? "ha" : "han"
  return { before: "", strong: `${responded} de ${total} ${noun}`, after: ` te ${verb} respondido.` }
}

// The median days to first response as a sentence, or null so the caller omits the line.
// It is a median, so the copy says "suelen" and never "en promedio".
export const formatResponseTime = (median: number | null): EmphasizedText | null => {
  if (median === null) return null
  const days = Math.round(median)
  if (days === 0) {
    return { before: "Las empresas suelen responderte ", strong: "el mismo día", after: "." }
  }
  return {
    before: "Las empresas suelen tardar ",
    strong: `${days} ${days === 1 ? "día" : "días"}`,
    after: " en responderte.",
  }
}
