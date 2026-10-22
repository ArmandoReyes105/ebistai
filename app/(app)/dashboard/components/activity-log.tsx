import { dayKey } from "@/lib/domain/activity-dates"
import { build14DayChart, buildMonthGrid } from "@/lib/domain/activity-chart"
import type { ActivityMovement } from "@/types/stats.types"
import { useMemo } from "react"
import ActivityChart from "./activity-chart"
import ActivityHeatmap from "./activity-heatmap"
import { LABEL, SECTION_TITLE } from "./styles"

interface ActivityLogProps {
  movements: ActivityMovement[]
  now: Date
  timeZone: string
}

// Buckets the raw UTC movements by the browser's local day. Only rendered
// once the time zone is known and the activity is ready (hydration rule).
const ActivityLog = ({ movements, now, timeZone }: ActivityLogProps) => {
  const days = useMemo(
    () => build14DayChart(movements, now, timeZone),
    [movements, now, timeZone]
  )
  const months = useMemo(
    () => buildMonthGrid(movements, now, timeZone),
    [movements, now, timeZone]
  )
  const total = days.reduce(
    (sum, day) => sum + day.newCount + day.advanceCount,
    0
  )

  return (
    <section
      aria-labelledby="log-title"
      className="grid min-w-0 border border-border bg-card 2xl:grid-cols-4"
    >
      <div className="flex min-w-0 flex-col gap-5 border-b border-border p-6 sm:px-7 2xl:col-span-3 2xl:border-r 2xl:border-b-0">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
            <h2 id="log-title" className={SECTION_TITLE}>
              Registro de actividad
            </h2>
            <span className={LABEL}>
              Últimos 14 días · {total}{" "}
              {total === 1 ? "movimiento" : "movimientos"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="size-3 bg-foreground" />
              Postulación nueva
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="box-border size-3 border-2 border-foreground"
              />
              Avance
            </span>
          </div>
        </div>
        <ActivityChart days={days} />
      </div>

      <div className="min-w-0 p-6">
        <ActivityHeatmap months={months} today={dayKey(now, timeZone)} />
      </div>
    </section>
  )
}

export default ActivityLog
