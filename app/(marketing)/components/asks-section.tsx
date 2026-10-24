import { cn } from "@/lib/utils"
import Reveal from "./reveal"
import SectionHeader from "./section-header"

const ASKS = [
  {
    question: "¿Cómo va mi búsqueda este mes?",
    tool: "get_stats",
    what: "Tus totales y cuántas postulaciones hay en cada etapa.",
  },
  {
    question: "¿Qué vacantes se quedaron en silencio?",
    tool: "get_radar",
    what: "Las que pasaron tu umbral sin avanzar de etapa.",
  },
  {
    question: "Registra esta vacante: [enlace]",
    tool: "create_application",
    what: "La da de alta con los datos de la vacante. Si ya la tenías, te avisa antes de duplicarla.",
    highlight: true,
  },
  {
    question: "¿Cuáles siguen en Entrevista?",
    tool: "list_applications",
    what: "Tus postulaciones filtradas por etapa.",
  },
  {
    question: "¿Qué anoté de la entrevista con Nube Cobre?",
    tool: "get_application",
    what: "El historial completo de un proceso, con tus notas.",
  },
  {
    question: "Ayúdame a priorizar mi semana",
    tool: "tu IA",
    what: "Combina todo lo anterior y te propone por dónde empezar.",
  },
]

const AsksSection = () => {
  return (
    <section
      id="preguntale"
      aria-labelledby="asks-title"
      className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-4 py-16 sm:px-8 sm:py-24"
    >
      <Reveal>
        <SectionHeader
          eyebrow="02 · Qué le preguntas"
          titleId="asks-title"
          title="Habla con tu búsqueda como hablas con tu IA"
          description="Tu IA consulta Ebistai cuando lo necesita: tus postulaciones, sus etapas, tus notas, tus números y el radar. Tú solo preguntas."
        />
      </Reveal>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ASKS.map((ask, index) => (
          <li key={ask.question}>
            <Reveal delay={(index % 3) * 100} className="h-full">
              <article
                className={cn(
                  "flex h-full min-h-52 flex-col gap-6 border p-6",
                  ask.highlight
                    ? "border-foreground bg-foreground text-background"
                    : "bg-card"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "font-mono text-xs tracking-wider uppercase",
                      ask.highlight
                        ? "text-background/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "border px-2 py-1 font-mono text-xs tracking-wider uppercase",
                      ask.highlight
                        ? "border-background/30 text-background/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {ask.tool}
                  </span>
                </div>
                <p className="mt-auto text-2xl font-semibold tracking-tight text-balance">
                  “{ask.question}”
                </p>
                <span
                  className={cn(
                    "text-sm text-pretty",
                    ask.highlight
                      ? "text-background/70"
                      : "text-muted-foreground"
                  )}
                >
                  {ask.what}
                </span>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default AsksSection
