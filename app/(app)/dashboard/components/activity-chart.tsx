import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { layoutDaySlots, type ChartDay } from "@/lib/domain/activity-chart"
import {
  describeDayCounts,
  weekdayInitial,
} from "@/lib/domain/dashboard-format"
import { cn } from "cn"
import { FOCUS_RING } from "./styles"

interface ActivityChartProps {
  days: ChartDay[]
}

const SQUARE = "box-border size-3.5 border-2"

// Days shown when the log column's content box is narrower than 420px, the
// former min-width of the 14-day grid (14 x 30px). The switch is a container
// query on the log column (ActivityLog), so it never needs a horizontal
// scroll. The 420px and the column counts are literal in the JSX classes
// because Tailwind needs full class names.
export const COMPACT_DAYS = 7

const ActivityChart = ({ days }: ActivityChartProps) => {
  const lastIndex = days.length - 1
  const firstCompactIndex = days.length - COMPACT_DAYS

  return (
    <div
      role="region"
      aria-label="Gráfica de movimientos recientes"
      tabIndex={0}
      className={cn("scrollbar-ui overflow-x-auto pb-2", FOCUS_RING)}
    >
      <ul className="grid grid-cols-[repeat(7,minmax(28px,1fr))] items-end @min-[420px]:grid-cols-[repeat(14,minmax(28px,1fr))]">
        {days.map((day, index) => {
          const today = index === lastIndex
          const { squares, overflow } = layoutDaySlots(
            day.newCount,
            day.advanceCount
          )
          const label = describeDayCounts(
            day.date,
            day.newCount,
            day.advanceCount
          )
          const hasMovement = day.newCount + day.advanceCount > 0
          const dayNumber = Number(day.date.slice(8))

          return (
            <li
              key={day.date}
              className={cn(
                "flex justify-center",
                // Hidden (and out of the a11y tree) in the compact week view.
                index < firstCompactIndex && "hidden @min-[420px]:flex"
              )}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label={label}
                      className={cn(
                        "flex cursor-default flex-col items-center gap-2.5 px-1",
                        FOCUS_RING
                      )}
                    />
                  }
                >
                  {/* column-reverse: the first slot (a new application) sits at the bottom. */}
                  <span
                    aria-hidden="true"
                    className="flex h-26 flex-col-reverse justify-start gap-1.5"
                  >
                    {squares.map((kind, slot) => (
                      <span
                        key={slot}
                        className={cn(
                          SQUARE,
                          today ? "border-primary" : "border-foreground",
                          kind === "new" &&
                            (today ? "bg-primary" : "bg-foreground")
                        )}
                      />
                    ))}
                    {overflow > 0 && (
                      <span
                        className={cn(
                          "flex h-3.5 items-center justify-center font-mono text-[11px] leading-none font-medium",
                          today ? "text-primary-text" : "text-foreground"
                        )}
                      >
                        +{overflow}
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "text-xl tracking-tight tabular-nums",
                      today
                        ? "font-semibold text-primary-text"
                        : hasMovement
                          ? "text-foreground"
                          : "text-muted-foreground"
                    )}
                  >
                    {dayNumber}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "font-mono text-[10px] uppercase",
                      today ? "text-primary-text" : "text-muted-foreground"
                    )}
                  >
                    {today ? "Hoy" : weekdayInitial(day.date)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ActivityChart
