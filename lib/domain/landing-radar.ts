// Scale of the sample radar track on the landing page. 40 days fills the
// bar; anything beyond is capped so long waits never overflow the track.
const TRACK_DAYS = 40

const toPercent = (days: number) => {
  if (!Number.isFinite(days) || days <= 0) return 0
  return Math.min(100, (days / TRACK_DAYS) * 100)
}

export const radarBarPercent = (days: number) => toPercent(days)

export const radarThresholdPercent = (thresholdDays: number) =>
  toPercent(thresholdDays)
