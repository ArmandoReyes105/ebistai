import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { stageBadgeConfig } from "@/lib/components/badge-config"
import { dayKey } from "@/lib/domain/activity-dates"
import { barPercent, thresholdPercent } from "@/lib/domain/dashboard-metrics"
import {
  daysSinceInstant,
  formatShortDate,
} from "@/lib/domain/dashboard-format"
import type { JobApplication } from "@/types/job-application.types"
import { ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"
import { LABEL } from "./styles"

interface RadarRowProps {
  application: JobApplication
  // 1-based position in the list.
  position: number
  thresholdDays: number
  // Bar scale in days, shared by every row (see scaleDays).
  scale: number
  now: Date
  timeZone: string
  pending: boolean
  onMarkAsIgnored: (id: string) => void
}

// Inactivity counts from the last stage change; fall back to the apply date.
export const lastProgressOf = (application: JobApplication) =>
  application.lastProgressAt ?? application.dateApplied

const RadarRow = ({
  application,
  position,
  thresholdDays,
  scale,
  now,
  timeZone,
  pending,
  onMarkAsIgnored,
}: RadarRowProps) => {
  const lastProgress = lastProgressOf(application)
  const days = daysSinceInstant(lastProgress, now, timeZone)
  // /stats sends `stage` as a NUMBER: it indexes the shared config directly.
  const stageLabel = stageBadgeConfig[application.stage].label

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 border-b border-border py-5 last:border-b-0">
      <div className="flex min-w-0 flex-col gap-1">
        <span className={LABEL}>
          {String(position).padStart(2, "0")} · {stageLabel}
        </span>
        <span className="text-[17px] font-semibold break-words">
          {application.company} · {application.jobTitle}
        </span>
        <span className="text-sm text-muted-foreground">
          Último avance el {formatShortDate(dayKey(lastProgress, timeZone))}
        </span>
      </div>

      <div className="flex items-baseline justify-end gap-1">
        <span className="text-[44px] leading-[0.9] font-medium tracking-tighter tabular-nums">
          {days}
        </span>
        <span className={LABEL}>{days === 1 ? "día" : "días"}</span>
      </div>

      <div aria-hidden="true" className="relative col-span-2 mt-2 h-2 bg-muted">
        <span
          className="absolute inset-y-0 left-0 bg-foreground"
          style={{ width: `${barPercent(days, scale)}%` }}
        />
        <span
          className="absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 bg-primary"
          style={{ left: `${thresholdPercent(thresholdDays, scale)}%` }}
        />
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => onMarkAsIgnored(application.id)}
          className="min-h-11 gap-2 px-4 text-sm"
        >
          {pending && <Spinner aria-label="Marcando como ignorada" />}
          Marcar como ignorada
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/job-applications/${application.id}`} />}
          aria-label={`Ver postulación de ${application.company}`}
          className="size-11"
        >
          <ArrowUpRightIcon />
        </Button>
      </div>
    </li>
  )
}

export default RadarRow
