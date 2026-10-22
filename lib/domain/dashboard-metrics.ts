const MIN_SCALE_DAYS = 30

const clampPercent = (value: number): number =>
  Math.min(100, Math.max(0, value))

// The radar bar scale: 30 days, or the ghosting threshold when it is longer.
export const scaleDays = (thresholdDays: number): number =>
  Math.max(MIN_SCALE_DAYS, thresholdDays)

// Width of a radar bar, 0..100.
export const barPercent = (days: number, thresholdDays: number): number =>
  clampPercent((days / scaleDays(thresholdDays)) * 100)

// Position of the threshold tick on a radar bar, 0..100.
export const thresholdPercent = (thresholdDays: number): number =>
  clampPercent((thresholdDays / scaleDays(thresholdDays)) * 100)

// Integer percentage; 0 when there is nothing to divide by (never NaN).
export const pct = (count: number, total: number): number =>
  total <= 0 ? 0 : Math.round((count / total) * 100)

// Median days to first response as shown in the UI: an integer, or an em dash.
export const formatMedian = (median: number | null): string =>
  median === null ? "—" : String(Math.round(median))

// Response rate as an integer percent, or null so the caller omits the line.
export const formatRate = (rate: number | null): number | null =>
  rate === null ? null : Math.round(rate)
