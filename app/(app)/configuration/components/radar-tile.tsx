import { Skeleton } from "@/components/ui/skeleton"
import type { AsyncState } from "@/types/async-state.types"
import { cn } from "cn"
import DayRuler from "./day-ruler"
import { LABEL, TILE, TILE_TEXT } from "./styles"

interface RadarTileProps {
  thresholdDays?: number
  isLoading: boolean
  // Applications in the radar for the saved threshold.
  count: AsyncState<number>
  onThresholdChange: (days: number) => void
}

const RadarCount = ({ count }: { count: AsyncState<number> }) => {
  if (count.status === "loading") {
    return <Skeleton aria-hidden="true" className="h-4 w-28" />
  }

  return (
    <span className={LABEL}>
      Hoy:{" "}
      <strong className="font-semibold text-foreground">
        {count.status === "ready" ? count.data : "—"}
      </strong>{" "}
      en el radar
    </span>
  )
}

const RadarTile = ({
  thresholdDays,
  isLoading,
  count,
  onThresholdChange,
}: RadarTileProps) => (
  <section
    aria-labelledby="radar-heading"
    className={cn(TILE, "basis-full gap-6")}
  >
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex flex-col gap-2.5">
        <span className={LABEL}>01 · Radar</span>
        <h2
          id="radar-heading"
          className="text-2xl/tight font-semibold tracking-tight"
        >
          Radar anti-ghosting
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <RadarCount count={count} />
        <span className={cn(LABEL, "border border-foreground px-2 py-1.5")}>
          Activo
        </span>
      </div>
    </div>

    <p className={cn(TILE_TEXT, "max-w-[620px] leading-[1.55]")}>
      Cuenta los días desde tu último avance en cada postulación activa, menos
      Oferta. Cuando pasa el umbral, Tai te sugiere marcarla como «Ignorada».
      Nunca cambia el estado sin tu confirmación.
    </p>

    <div className="flex flex-col gap-3">
      <span id="radar-threshold-label" className={LABEL}>
        Días sin noticias para sugerir «Ignorada»
      </span>
      {isLoading || thresholdDays === undefined ? (
        <Skeleton aria-hidden="true" className="h-28" />
      ) : (
        <DayRuler
          labelledBy="radar-threshold-label"
          value={thresholdDays}
          onChange={onThresholdChange}
        />
      )}
    </div>
  </section>
)

export default RadarTile
