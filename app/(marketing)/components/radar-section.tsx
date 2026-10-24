import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  radarBarPercent,
  radarThresholdPercent,
} from "@/lib/domain/landing-radar"
import BoardBenefits from "./benefits-section"
import Reveal from "./reveal"
import SectionHeader from "./section-header"

const DEFAULT_THRESHOLD_DAYS = 14
const THRESHOLDS = [14, 21, 25, 30, 45]

const RADAR_ROWS = [
  { role: "Desarrolladora frontend", company: "Taller Lumbre", days: 31 },
  { role: "Ingeniero full stack", company: "Nube Cobre", days: 27 },
  { role: "Desarrollador backend", company: "Fondeo Sur", days: 23 },
]

const STAGES = [
  { label: "Aplicada", count: 12, color: "bg-ramp-1" },
  { label: "Entrevista", count: 5, color: "bg-ramp-2" },
  { label: "Prueba técnica", count: 2, color: "bg-ramp-3" },
  { label: "Ent. técnica", count: 1, color: "bg-ramp-4" },
  { label: "Oferta", count: 1, color: "bg-primary" },
]

const TOTAL = STAGES.reduce((sum, stage) => sum + stage.count, 0)

// Dashboard and radar as the base of the product: static sample data, not a
// live view.
const RadarSection = () => {
  const thresholdLeft = `${radarThresholdPercent(DEFAULT_THRESHOLD_DAYS)}%`

  return (
    <section
      id="radar"
      aria-labelledby="board-title"
      className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-4 py-16 sm:px-8 sm:py-24"
    >
      <Reveal>
        <SectionHeader
          eyebrow="05 · El tablero"
          titleId="board-title"
          title="Y cuando quieras verlo tú, todo está en tu tablero"
          description="Lo que tu IA consulta es lo mismo que ves en Ebistai: tus postulaciones por etapa, tus números y el radar anti-ghosting."
        />
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="h-full lg:col-span-2">
          <article
            aria-labelledby="radar-card-title"
            className="flex h-full flex-col border bg-card"
          >
            <div className="flex items-stretch border-b border-foreground">
              <div
                aria-hidden="true"
                className="relative flex w-24 flex-none items-center justify-center border-r bg-muted p-3 sm:w-32"
              >
                <Image src="/koi.png" alt="" width={72} height={72} />
                <span className="absolute top-2 right-2 flex h-6 min-w-6 items-center justify-center bg-primary px-1 text-sm font-bold text-primary-foreground">
                  {RADAR_ROWS.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2 px-4 py-4 sm:px-6">
                <h3
                  id="radar-card-title"
                  className="text-xl font-semibold tracking-tight sm:text-2xl"
                >
                  Radar anti-ghosting
                </h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  Yo me fijo en quién no te ha respondido. Cuento los días desde
                  tu último cambio de etapa y te muestro las vacantes que
                  pasaron tu umbral.
                </p>
              </div>
            </div>

            <ul className="flex flex-col px-4 sm:px-6">
              {RADAR_ROWS.map((row, index) => (
                <li
                  key={row.role}
                  className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-b py-4"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                      {String(index + 1).padStart(2, "0")} · Aplicada
                    </span>
                    <span className="text-base font-semibold">{row.role}</span>
                    <span className="text-sm text-muted-foreground">
                      {row.company}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl leading-none font-medium tracking-tighter">
                      {row.days}
                    </span>
                    <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                      días
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="relative col-span-2 h-1.5 bg-muted"
                  >
                    <span
                      className="absolute inset-y-0 left-0 bg-foreground"
                      style={{ width: `${radarBarPercent(row.days)}%` }}
                    />
                    <span
                      className="absolute -inset-y-1 w-0.5 bg-primary"
                      style={{ left: thresholdLeft }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 px-4 py-4 sm:px-6">
              <p className="text-sm font-semibold">
                Umbral configurable: 14, 21, 25, 30 o 45 días
              </p>
              <ul className="flex flex-wrap gap-2">
                {THRESHOLDS.map((days) => (
                  <li
                    key={days}
                    className={cn(
                      "flex h-9 items-center border px-3 text-sm font-medium",
                      days === DEFAULT_THRESHOLD_DAYS &&
                        "border-foreground bg-foreground text-background"
                    )}
                  >
                    {days} días
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>

        <Reveal delay={150} className="h-full">
          <div className="flex h-full flex-col gap-4">
            <div className="flex flex-col overflow-hidden bg-primary text-primary-foreground">
              <div
                aria-hidden="true"
                className="landing-hatch h-12 border-b-2 border-primary-foreground sm:h-14"
              />
              <div className="flex flex-col gap-2 px-6 py-4">
                <span className="font-mono text-xs tracking-wider uppercase">
                  Total
                </span>
                <span className="text-8xl leading-none font-medium tracking-tighter">
                  {TOTAL}
                </span>
                <span className="text-sm">postulaciones en tu tablero</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 border bg-card px-6 py-4">
              <h3 className="text-lg font-semibold">Etapas</h3>
              <div aria-hidden="true" className="flex h-2.5 gap-0.5">
                {STAGES.map((stage) => (
                  <span
                    key={stage.label}
                    className={stage.color}
                    style={{ flexGrow: stage.count, flexBasis: 0 }}
                  />
                ))}
              </div>
              <ul className="flex flex-col">
                {STAGES.map((stage) => (
                  <li
                    key={stage.label}
                    className="flex items-baseline justify-between border-t py-2"
                  >
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className={cn("size-2.5", stage.color)}
                      />
                      {stage.label}
                    </span>
                    <span className="text-xl font-medium">{stage.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      <BoardBenefits />
    </section>
  )
}

export default RadarSection
