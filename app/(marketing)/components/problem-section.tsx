import { Check, X } from "lucide-react"
import Reveal from "./reveal"
import SectionHeader from "./section-header"

const BEFORE = [
  "Copias y pegas filas en el chat cada vez que quieres un análisis.",
  "No sabes cuáles llevan semanas sin respuesta.",
  "La etapa de cada proceso vive solo en tu memoria.",
]

const AFTER = [
  "Tu IA consulta tus postulaciones, sus etapas y tus notas cuando se lo pides.",
  "El radar le dice cuáles se quedaron en silencio.",
  "Le pasas el enlace de una vacante y la registra por ti.",
]

const ProblemSection = () => {
  return (
    <section
      aria-labelledby="problem-title"
      className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-8 sm:py-24"
    >
      <Reveal>
        <SectionHeader
          eyebrow="01 · El problema"
          titleId="problem-title"
          title="Tu IA no puede ayudarte con lo que no ve"
          description="Mandas decenas de postulaciones y casi nadie responde. Tu búsqueda vive en un Excel que nadie actualiza, y cada vez que quieres un análisis terminas copiando y pegando filas en el chat."
        />
      </Reveal>
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal className="h-full">
          <article
            aria-labelledby="before-title"
            className="flex h-full flex-col gap-6 border bg-card p-6 sm:p-8"
          >
            <h3
              id="before-title"
              className="text-xl font-semibold text-muted-foreground"
            >
              Con el Excel
            </h3>
            <ul className="flex flex-col">
              {BEFORE.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-t py-4 text-base text-pretty text-muted-foreground"
                >
                  <X aria-hidden="true" className="mt-1 size-4 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
        <Reveal delay={150} className="h-full">
          <article
            aria-labelledby="after-title"
            className="flex h-full flex-col gap-6 bg-foreground p-6 text-background sm:p-8"
          >
            <h3
              id="after-title"
              className="flex items-center gap-2 text-xl font-semibold"
            >
              <span aria-hidden="true" className="size-2 bg-primary" />
              Con Ebistai y tu IA
            </h3>
            <ul className="flex flex-col">
              {AFTER.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-t border-background/20 py-4 text-base text-pretty"
                >
                  <Check
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-primary"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  )
}

export default ProblemSection
