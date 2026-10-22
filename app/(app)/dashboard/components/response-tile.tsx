import { formatMedian, formatRate } from "@/lib/domain/dashboard-metrics"

interface ResponseTileProps {
  median: number | null
  rate: number | null
}

// The red tile: median days from applying to the first response.
const ResponseTile = ({ median, rate }: ResponseTileProps) => {
  const rateValue = formatRate(rate)

  return (
    <div className="flex min-h-[180px] min-w-0 flex-col overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden="true"
        className="h-20 shrink-0 border-b-2 border-primary-foreground bg-[repeating-linear-gradient(135deg,var(--color-primary-foreground)_0_2px,transparent_2px_9px)]"
      />
      <div className="flex flex-1 flex-col justify-between gap-4 px-6 pt-5 pb-6">
        <span className="font-mono text-xs font-medium tracking-wider uppercase">
          Días hasta respuesta
        </span>
        <span className="text-7xl leading-[0.85] font-medium tracking-tighter tabular-nums sm:text-8xl">
          {formatMedian(median)}
        </span>
        {rateValue !== null && (
          <span className="text-sm">
            {rateValue}% de tus postulaciones recibió respuesta (30 días)
          </span>
        )}
      </div>
    </div>
  )
}

export default ResponseTile
