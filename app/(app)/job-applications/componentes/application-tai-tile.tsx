"use client"

import TaiFigure, { type TaiPose } from "@/components/tai/tai-figure"
import { useRadarThreshold } from "@/hooks/use-radar-threshold"
import { daysBetween, lastEventDate } from "@/lib/domain/dates"
import { Status } from "@/types/enums"
import { ApplicationEvent, JobApplication } from "@/types/job-application.types"

interface ApplicationTaiTileProps {
  application: JobApplication
  // Ordered by sequence: oldest first.
  events: ApplicationEvent[]
}

interface TaiState {
  pose: TaiPose
  label: string
  days: number
  caption: string
}

const getState = (
  application: JobApplication,
  events: ApplicationEvent[],
  threshold: number
): TaiState => {
  const applied = new Date(application.dateApplied)

  if (application.status !== Status.Active) {
    return {
      pose: "sleep",
      label: "Tai · proceso cerrado",
      days: Math.max(
        0,
        daysBetween(lastEventDate(events, applied), new Date())
      ),
      caption: "días desde que cerró",
    }
  }

  const days = Math.max(
    0,
    daysBetween(new Date(application.lastProgressAt ?? applied), new Date())
  )

  if (days >= threshold) {
    return {
      pose: "sleep",
      label: "Tai · se está enfriando",
      days,
      caption: "días sin respuesta",
    }
  }

  let caption = "días desde el último avance"
  if (days === 0) caption = "hoy hubo avance"
  else if (days === 1) caption = "día desde el último avance"

  return { pose: "neutral", label: "Tai · último avance", days, caption }
}

const ApplicationTaiTile = ({
  application,
  events,
}: ApplicationTaiTileProps) => {
  const threshold = useRadarThreshold()
  const { pose, label, days, caption } = getState(
    application,
    events,
    threshold
  )
  const summary =
    days === 0 && pose === "neutral"
      ? `${label}: ${caption}`
      : `${label}: ${days} ${caption}`

  return (
    // flex-1: fills its grid cell so it matches Progreso's height side by side.
    <div className="flex min-w-[220px] flex-1 flex-col overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden="true"
        className="h-14 shrink-0 border-b-2 border-primary-foreground bg-[repeating-linear-gradient(135deg,var(--color-primary-foreground)_0_2px,transparent_2px_9px)]"
      />
      <div className="flex flex-1 flex-col justify-between gap-3 px-6 pt-5 pb-6">
        <span className="sr-only">{summary}</span>
        <p aria-hidden="true" className="font-mono text-xs uppercase">
          {label}
        </p>
        <TaiFigure pose={pose} className="w-32 self-end" />
        <div aria-hidden="true" className="flex items-end gap-2.5">
          <span className="text-7xl leading-[0.85] font-medium tracking-tight tabular-nums">
            {days}
          </span>
          <span className="text-sm">{caption}</span>
        </div>
      </div>
    </div>
  )
}

export default ApplicationTaiTile
