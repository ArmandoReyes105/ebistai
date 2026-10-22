import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  heatLevel,
  type HeatLevel,
  type MonthGrid,
} from "@/lib/domain/activity-chart"
import { describeHeatCell, monthLabel } from "@/lib/domain/dashboard-format"
import { cn } from "cn"
import { FOCUS_RING, LABEL } from "./styles"

interface ActivityHeatmapProps {
  months: MonthGrid[]
  // "yyyy-MM-dd" of the local today.
  today: string
}

// Full class names (not built from the level) so Tailwind generates them.
const RAMP_CLASS: Record<HeatLevel, string> = {
  0: "bg-ramp-0",
  1: "bg-ramp-1",
  2: "bg-ramp-2",
  3: "bg-ramp-3",
  4: "bg-ramp-4",
}

const CELL = "block size-2.5"

const ActivityHeatmap = ({ months, today }: ActivityHeatmapProps) => (
  <div className="flex min-w-0 flex-col gap-4">
    <span className={LABEL}>Últimos 3 meses</span>

    <div
      role="region"
      aria-label="Mapa de calor de los últimos 3 meses"
      tabIndex={0}
      className={cn("scrollbar-ui overflow-x-auto pb-2", FOCUS_RING)}
    >
      <div className="flex w-max gap-4">
        {months.map((month) => (
          <div key={month.month} className="flex flex-col gap-2.5">
            <span className="text-[13px] font-semibold">
              {monthLabel(month.month)}
            </span>
            <div className="grid grid-cols-7 gap-0.5">
              {month.weeks.flat().map((cell, index) => {
                if (cell === null) {
                  return (
                    <span
                      key={`pad-${index}`}
                      aria-hidden="true"
                      className={CELL}
                    />
                  )
                }
                if (cell.future) {
                  // Muted, no count, not focusable.
                  return (
                    <span
                      key={cell.date}
                      aria-hidden="true"
                      className={cn(CELL, "bg-muted/60")}
                    />
                  )
                }
                const label = describeHeatCell(cell.date, cell.count)
                return (
                  <Tooltip key={cell.date}>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          aria-label={label}
                          className={cn(
                            CELL,
                            "cursor-default p-0",
                            RAMP_CLASS[heatLevel(cell.count)],
                            cell.date === today &&
                              "outline-2 outline-offset-1 outline-primary",
                            FOCUS_RING
                          )}
                        />
                      }
                    />
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>Menos</span>
      {([0, 1, 2, 3, 4] as const).map((level) => (
        <span
          key={level}
          aria-hidden="true"
          className={cn("size-2", RAMP_CLASS[level])}
        />
      ))}
      <span>Más</span>
    </div>
  </div>
)

export default ActivityHeatmap
