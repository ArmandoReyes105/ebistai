import { describeActivityEvent } from "@/lib/domain/activity-feed"
import { formatActivityWhen } from "@/lib/domain/dashboard-format"
import type { ActivityEvent } from "@/types/stats.types"
import { cn } from "cn"
import Link from "next/link"
import { FOCUS_RING, LABEL, SECTION_TITLE } from "./styles"

interface RecentActivityProps {
  events: ActivityEvent[]
  now: Date
  timeZone: string
}

// Square marker by kind: filled = new, outlined = advance, grey = closed.
const MARKER_CLASS = {
  new: "bg-foreground border-foreground",
  advance: "bg-transparent border-foreground",
  closed: "bg-muted-foreground border-muted-foreground",
} as const

const RecentActivity = ({ events, now, timeZone }: RecentActivityProps) => (
  <section
    aria-labelledby="activity-title"
    className="flex w-full min-w-0 flex-col gap-1 border border-border bg-card p-6 sm:p-7"
  >
    <h2 id="activity-title" className={cn(SECTION_TITLE, "mb-3")}>
      Actividad reciente
    </h2>

    {events.length === 0 ? (
      <p className="border-t border-border pt-4 text-sm text-muted-foreground">
        Aguas tranquilas por ahora. Registra una postulación y aquí la seguimos
        juntos.
      </p>
    ) : (
      <ul className="flex flex-col">
        {events.map((event, index) => {
          const { text, marker, automatic } = describeActivityEvent(event)
          return (
            <li
              key={`${event.applicationId}-${event.occurredAt}-${index}`}
              className="border-t border-border"
            >
              <Link
                href={`/job-applications/${event.applicationId}`}
                className={cn(
                  "grid grid-cols-[4.5rem_1.25rem_minmax(0,1fr)] items-start gap-x-3 py-3 hover:bg-muted/50 sm:grid-cols-[5.5rem_1.25rem_minmax(0,1fr)]",
                  FOCUS_RING
                )}
              >
                <span className={cn(LABEL, "pt-0.5")}>
                  {formatActivityWhen(event.occurredAt, now, timeZone)}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 box-border size-2.5 border-2",
                    MARKER_CLASS[marker]
                  )}
                />
                <span className="min-w-0 text-[15px] break-words">
                  <strong className="font-semibold">{event.company}</strong>{" "}
                  {/* "Ignorada automáticamente" is a label, not a verb phrase. */}
                  {event.kind === "closed" && automatic ? "· " : ""}
                  {text}
                  {event.kind !== "new" && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {event.jobTitle}
                    </span>
                  )}
                  {automatic && event.kind !== "closed" && (
                    <span className="text-muted-foreground"> · Automático</span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    )}
  </section>
)

export default RecentActivity
