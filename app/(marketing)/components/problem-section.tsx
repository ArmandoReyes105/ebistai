import { CircleCheck, CircleX } from "lucide-react"
import Reveal from "./reveal"

const BEFORE = [
  "Una fila por postulación y columnas que nadie actualiza.",
  "No sabes cuáles llevan semanas sin respuesta.",
  "La etapa de cada proceso vive solo en tu memoria.",
]

const AFTER = [
  "Cada postulación guarda título, empresa, enlace, fuente, modalidad, fecha y notas.",
  "El radar te muestra las que se quedaron en silencio.",
  "Cada proceso avanza por etapas que puedes ver de un vistazo.",
]

const ProblemSection = () => {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-24 sm:px-8">
      <Reveal className="flex max-w-170 flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Tu búsqueda no cabe en una hoja de cálculo
        </h2>
        <p className="text-base text-pretty text-muted-foreground">
          Mandas decenas de postulaciones y casi nadie responde. Cuando abres
          el Excel ya no recuerdas cuál sigue vivo. Ebistai pone todo en un
          tablero para que sepas dónde estás parado.
        </p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal className="h-full">
          <div className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-6">
            <h3 className="text-xl font-semibold">Con el Excel</h3>
            <ul className="flex flex-col gap-3">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CircleX className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-base text-pretty text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={150} className="h-full">
          <div className="flex h-full flex-col gap-4 rounded-2xl border border-primary bg-card p-6">
            <h3 className="text-xl font-semibold">Con Ebistai</h3>
            <ul className="flex flex-col gap-3">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CircleCheck className="mt-1 size-4 shrink-0 text-primary" />
                  <span className="text-base text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ProblemSection
