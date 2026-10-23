"use client"

import { THRESHOLD_OPTIONS, rulerPercent } from "@/lib/domain/config-settings"
import { cn } from "cn"
import { BUTTON_SIZE, FOCUS_RING, LABEL } from "./styles"
import { useRovingRadios } from "./use-roving-radios"

interface DayRulerProps {
  // Id of the element that names the radiogroup.
  labelledBy: string
  value: number
  onChange: (days: number) => void
}

// Position along the ruler; the last option sits flush with the right edge
// instead of being centered on it, so it never overflows.
const placement = (percent: number) =>
  percent >= 100
    ? { right: 0 }
    : { left: `${percent}%`, transform: "translateX(-50%)" }

// Roving tabindex: the selected radio is the only tab stop (the first one
// when the saved value is not among the options).
const isTabStop = (days: number, index: number, value: number) =>
  days === value ||
  (!THRESHOLD_OPTIONS.some((option) => option === value) && index === 0)

// The ruler: "En curso" up to the chosen day, the hatched red zone after it,
// and one radio per option placed proportionally. It needs 520px.
const Ruler = ({ labelledBy, value, onChange }: DayRulerProps) => {
  // Arrows only move focus: selecting saves, so it takes Space/Enter/click.
  const { onKeyDown, setRef } = useRovingRadios(THRESHOLD_OPTIONS.length)
  const selected = rulerPercent(value)

  return (
    <div className="relative h-28">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 flex h-8 border border-foreground"
      >
        <span
          className={cn(
            LABEL,
            "flex shrink-0 items-center overflow-hidden bg-muted pl-2.5 whitespace-nowrap"
          )}
          style={{ width: `${selected}%` }}
        >
          En curso
        </span>
        <span className="flex-1 border-l-2 border-foreground [background:repeating-linear-gradient(135deg,var(--primary)_0_2px,transparent_2px_9px)]" />
      </div>

      <span aria-hidden="true" className={cn(LABEL, "absolute top-11 left-0")}>
        Último avance
      </span>

      <div role="radiogroup" aria-labelledby={labelledBy}>
        {THRESHOLD_OPTIONS.map((days, index) => {
          const isSelected = days === value

          return (
            <button
              key={days}
              ref={setRef(index)}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${days} días`}
              tabIndex={isTabStop(days, index, value) ? 0 : -1}
              onClick={() => onChange(days)}
              onKeyDown={onKeyDown(index)}
              style={{ top: 40, ...placement(rulerPercent(days)) }}
              className={cn(
                "absolute min-w-10 border px-3 text-[15px] tabular-nums transition-colors pointer-coarse:min-w-11",
                BUTTON_SIZE,
                FOCUS_RING,
                isSelected
                  ? "border-foreground bg-foreground font-semibold text-background"
                  : "border-ramp-1 bg-card font-medium text-foreground hover:bg-muted"
              )}
            >
              {days}
            </button>
          )
        })}
      </div>

      <span
        aria-hidden="true"
        className={cn(LABEL, "absolute top-[94px] text-foreground")}
        style={placement(selected)}
      >
        días
      </span>
    </div>
  )
}

// Compact picker for narrow tiles (phones): a segmented row of "N días"
// options that wraps instead of scrolling.
const Segmented = ({ labelledBy, value, onChange }: DayRulerProps) => {
  const { onKeyDown, setRef } = useRovingRadios(THRESHOLD_OPTIONS.length)

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="flex w-fit max-w-full flex-wrap gap-1 border border-border p-1"
    >
      {THRESHOLD_OPTIONS.map((days, index) => {
        const isSelected = days === value

        return (
          <button
            key={days}
            ref={setRef(index)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isTabStop(days, index, value) ? 0 : -1}
            onClick={() => onChange(days)}
            onKeyDown={onKeyDown(index)}
            className={cn(
              "px-3 text-sm tabular-nums transition-colors",
              BUTTON_SIZE,
              FOCUS_RING,
              isSelected
                ? "bg-foreground font-semibold text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {days} días
          </button>
        )
      })}
    </div>
  )
}

// The threshold picker: the segmented row below lg, the ruler from lg up.
// It is a window breakpoint, not a container query, on purpose: the sidebar
// appears at md and takes 256px, so the tile width is not monotonic with the
// window and a 520px container query flipped back and forth. From lg the
// tile is always wider than the ruler's 520px. The hidden variant is
// display:none, out of the a11y tree.
const DayRuler = (props: DayRulerProps) => (
  <div>
    <div className="hidden lg:block">
      <Ruler {...props} />
    </div>
    <div className="lg:hidden">
      <Segmented {...props} />
    </div>
  </div>
)

export default DayRuler
