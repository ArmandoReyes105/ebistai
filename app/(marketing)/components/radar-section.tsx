import { Badge } from "@/components/ui/badge"
import { Check, Radar } from "lucide-react"
import Reveal from "./reveal"

const THRESHOLDS = [14, 21, 25, 30, 45]

const POINTS = [
  "Tú eliges cuántos días son demasiados sin noticias.",
  "Reviso tus postulaciones activas en cualquier etapa, menos Oferta, y marco las que se quedaron en silencio.",
  "Si quieres, las pasa a Ignorada, pero antes te muestro cuántas se van a afectar y tú confirmas.",
  "Si cambias de opinión, puedes revivir una Ignorada con un clic.",
]

const RadarSection = () => {
  return (
    <section
      id="radar"
      className="mx-auto grid w-full max-w-6xl scroll-mt-24 items-center gap-12 px-4 py-24 sm:px-8 md:grid-cols-2"
    >
      <Reveal className="flex flex-col gap-6">
        <Badge variant="outline" className="w-fit">
          <Radar /> Radar anti-ghosting
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Yo me fijo en quién no te ha respondido
        </h2>
        <p className="text-base text-pretty text-muted-foreground">
          Cuento los días desde tu último avance, o sea, desde el último cambio
          de etapa, y te muestro las vacantes que pasaron tu umbral. Así decides con calma si das seguimiento o sigues
          adelante.
        </p>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">
            Umbral configurable: 14, 21, 25, 30 o 45 días
          </p>
          <ul className="flex flex-wrap gap-2">
            {THRESHOLDS.map((days) => (
              <li key={days}>
                <Badge variant="secondary">{days} días</Badge>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
      <ul className="flex flex-col gap-3">
        {POINTS.map((point, index) => (
          <li key={point}>
            <Reveal delay={index * 100}>
              <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-base">
                <Check className="mt-1 size-4 shrink-0 text-primary" />
                <span className="text-pretty">{point}</span>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RadarSection
