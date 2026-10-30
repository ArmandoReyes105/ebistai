import TaiFigure from "@/components/tai/tai-figure"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { daysSinceInstant } from "@/lib/domain/dashboard-format"
import { scaleDays } from "@/lib/domain/dashboard-metrics"
import type { JobApplication } from "@/types/job-application.types"
import { cn } from "cn"
import { CheckIcon } from "lucide-react"
import Link from "next/link"
import RadarRow, { lastProgressOf } from "./radar-row"
import { FOCUS_RING, LABEL, SECTION_TITLE } from "./styles"

// The list is capped at max-h-68 (272px), about one and a half rows of ~180px.
// The footer hints at scrolling when there is more than one row.
const SCROLL_HINT_FROM = 1

interface RadarTileProps {
  applications: JobApplication[]
  thresholdDays: number
  now: Date
  timeZone: string
  pendingIds: ReadonlySet<string>
  onMarkAsIgnored: (id: string) => void
}

const subtitle = (count: number, thresholdDays: number) => {
  if (count === 0) {
    return `Ninguna postulación lleva más de ${thresholdDays} días sin respuesta`
  }
  return `${count} ${count === 1 ? "postulación sin respuesta" : "postulaciones sin respuesta"} hace más de ${thresholdDays} días`
}

const RadarTile = ({
  applications,
  thresholdDays,
  now,
  timeZone,
  pendingIds,
  onMarkAsIgnored,
}: RadarTileProps) => {
  const count = applications.length
  // The oldest application fills its bar; the others scale against it.
  const oldestDays = Math.max(
    0,
    ...applications.map((application) =>
      daysSinceInstant(lastProgressOf(application), now, timeZone)
    )
  )
  const scale = scaleDays(thresholdDays, oldestDays)

  return (
    <section
      aria-labelledby="radar-title"
      className="flex min-w-0 flex-col border border-border bg-card"
    >
      <div className="flex items-stretch border-b border-border">
        <div className="relative flex w-28 shrink-0 items-center justify-center border-r border-border bg-muted py-3 sm:w-32">
          <TaiFigure
            pose={count > 0 ? "cold" : "sleep"}
            outlined={false}
            compact
            className="w-20 sm:w-24"
          />
          {count > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-2.5 right-2.5 inline-flex h-6.5 min-w-6.5 items-center justify-center bg-primary px-1.5 text-sm font-bold text-primary-foreground tabular-nums"
            >
              {count}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-4 py-5 sm:px-6">
          <h2 id="radar-title" className={SECTION_TITLE}>
            Radar anti-ghosting
          </h2>
          <span className="text-sm text-muted-foreground">
            {subtitle(count, thresholdDays)}
          </span>
          <span className={LABEL}>
            Umbral · {thresholdDays} días ·{" "}
            <Link
              href="/configuration"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Ajustar
            </Link>
          </span>
        </div>
      </div>

      {count === 0 ? (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckIcon />
            </EmptyMedia>
            <EmptyTitle>Todo en orden</EmptyTitle>
            <EmptyDescription>Nadie te ha dejado en visto.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        // Capped height so a long radar scrolls inside the tile instead of
        // stretching the whole first row of the grid.
        <div
          role="region"
          aria-label="Postulaciones en el radar"
          tabIndex={0}
          className={cn(
            "scrollbar-ui max-h-68 overflow-y-auto scroll-shadow-y [--scrollbar-track:var(--color-card)]",
            FOCUS_RING
          )}
        >
          <ul className="flex flex-col px-4 sm:px-6">
            {applications.map((application, index) => (
              <RadarRow
                key={application.id}
                application={application}
                position={index + 1}
                thresholdDays={thresholdDays}
                scale={scale}
                now={now}
                timeZone={timeZone}
                pending={pendingIds.has(application.id)}
                onMarkAsIgnored={onMarkAsIgnored}
              />
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3.5 text-xs text-muted-foreground sm:px-6">
        <span aria-hidden="true" className="h-3 w-0.5 bg-primary" />
        <span>
          Umbral de {thresholdDays} días · la barra llega a {scale}
        </span>
        {count > SCROLL_HINT_FROM && (
          <span className="ml-auto">Desliza para ver las {count}</span>
        )}
      </div>
    </section>
  )
}

export default RadarTile
