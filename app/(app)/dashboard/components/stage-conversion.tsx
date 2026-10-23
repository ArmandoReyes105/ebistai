import { stageBadgeConfig } from "@/lib/components/badge-config"
import { stageFromName } from "@/lib/domain/stage-flow"
import type { StageConversion as StageConversionItem } from "@/types/stats.types"
import { cn } from "cn"
import { LABEL, SECTION_TITLE } from "./styles"

interface StageConversionProps {
  conversion: StageConversionItem[]
}

// Same API stage name, but never let an unknown one break the card.
const labelFor = (name: string): string => {
  try {
    return stageBadgeConfig[stageFromName(name)].label
  } catch {
    return name
  }
}

// One color per stage, in flow order: a neutral ramp that darkens as the
// process advances, and the brand red for the last stage (Offer). Full class
// names so Tailwind generates them.
const STAGE_COLORS = ["bg-ramp-1", "bg-ramp-2", "bg-ramp-3", "bg-ramp-4"]

const colorFor = (index: number, lastIndex: number): string =>
  index === lastIndex
    ? "bg-primary"
    : STAGE_COLORS[Math.min(index, STAGE_COLORS.length - 1)]

// Reach per stage, in the order received. Counts and percents come ready from
// the API (0 / 0% when there are no applications, never NaN).
const StageConversion = ({ conversion }: StageConversionProps) => {
  const lastIndex = conversion.length - 1

  return (
    <section
      aria-labelledby="conversion-title"
      className="flex min-w-0 flex-col gap-5 border border-border bg-card p-6 sm:px-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="conversion-title" className={SECTION_TITLE}>
          Conversión por etapa
        </h2>
        <span className={LABEL}>Todas tus postulaciones</span>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {conversion.map((item, index) => (
          <li key={item.stage} className="flex min-w-0 flex-col gap-1.5">
            <span
              className={cn(
                LABEL,
                "inline-flex items-center gap-2",
                index === lastIndex && "text-primary-text"
              )}
            >
              <span
                aria-hidden="true"
                className={cn("size-2.5", colorFor(index, lastIndex))}
              />
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-3xl font-medium tracking-tight tabular-nums">
              {item.count}
            </span>
            <span className="text-sm text-muted-foreground">
              {labelFor(item.stage)} · {item.pct}%
            </span>
            <div aria-hidden="true" className="h-1.5 bg-muted">
              <div
                className={cn("h-full", colorFor(index, lastIndex))}
                style={{ width: `${Math.min(100, Math.max(0, item.pct))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default StageConversion
