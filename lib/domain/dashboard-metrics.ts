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

// Median days to first response as shown in the UI: an integer, or an em dash.
export const formatMedian = (median: number | null): string =>
  median === null ? "—" : String(Math.round(median))

// Response rate as an integer percent, or null so the caller omits the line.
export const formatRate = (rate: number | null): number | null =>
  rate === null ? null : Math.round(rate)
