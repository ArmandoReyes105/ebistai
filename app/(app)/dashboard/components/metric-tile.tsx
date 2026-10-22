import { cn } from "cn"
import { LABEL } from "./styles"

interface MetricTileProps {
  label: string
  value: string | number
  caption?: string
  // "muted" is the grey tile of the mockup; "card" the white bordered one.
  tone?: "card" | "muted"
  className?: string
}

const MetricTile = ({
  label,
  value,
  caption,
  tone = "card",
  className,
}: MetricTileProps) => (
  <div
    className={cn(
      "flex min-h-[180px] min-w-0 flex-col justify-between gap-6 p-6",
      tone === "card" ? "border border-border bg-card" : "bg-muted",
      className
    )}
  >
    <span className={LABEL}>{label}</span>
    <div className="flex flex-col gap-1">
      <span className="text-6xl leading-[0.9] font-medium tracking-tighter tabular-nums sm:text-7xl">
        {value}
      </span>
      {caption && (
        <span className="text-sm text-muted-foreground">{caption}</span>
      )}
    </div>
  </div>
)

export default MetricTile
