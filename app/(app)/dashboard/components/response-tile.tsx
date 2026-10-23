import {
  type EmphasizedText,
  formatRate,
  formatResponseSummary,
  formatResponseTime,
} from "@/lib/domain/dashboard-metrics"

const Emphasized = ({ text }: { text: EmphasizedText }) => (
  <span>
    {text.before}
    <strong className="font-semibold">{text.strong}</strong>
    {text.after}
  </span>
)

interface ResponseTileProps {
  median: number | null
  rate: number | null
  responded: number
  total: number
}

// The red tile: all-time response rate, with the median days to first response as a secondary line.
const ResponseTile = ({ median, rate, responded, total }: ResponseTileProps) => {
  const rateValue = formatRate(rate)
  const responseTime = formatResponseTime(median)

  return (
    <div className="flex min-h-[180px] min-w-0 flex-col overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden="true"
        className="h-20 shrink-0 border-b-2 border-primary-foreground bg-[repeating-linear-gradient(135deg,var(--color-primary-foreground)_0_2px,transparent_2px_9px)]"
      />
      <div className="flex flex-1 flex-col justify-between gap-4 px-6 pt-5 pb-6">
        <span className="font-mono text-xs font-medium tracking-wider uppercase">
          Tasa de respuesta
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-7xl leading-[0.85] font-medium tracking-tighter tabular-nums sm:text-8xl">
            {rateValue === null ? "—" : `${rateValue}%`}
          </span>
          {rateValue !== null && (
            <span className="text-base font-medium">te han respondido</span>
          )}
        </div>
        <div className="flex flex-col gap-1 text-sm">
          {rateValue !== null && (
            <Emphasized text={formatResponseSummary(responded, total)} />
          )}
          {responseTime !== null && <Emphasized text={responseTime} />}
        </div>
      </div>
    </div>
  )
}

export default ResponseTile
