import { CirclePlus, Radar, Route } from "lucide-react"
import Reveal from "./reveal"

const STEPS = [
  {
    icon: CirclePlus,
    title: "Registra tu postulación",
    description:
      "Anota el título, la empresa, el enlace, de dónde salió la vacante, si es remota o presencial, la fecha y tus notas.",
  },
  {
    icon: Route,
    title: "Muévela por etapas",
    description:
      "Cuando te respondan, pásala a Entrevista, Técnica u Oferta. Si no sigue, márcala como Rechazada o Retirada.",
  },
  {
    icon: Radar,
    title: "Deja que el radar vigile",
    description:
      "Elige cuántos días son demasiados sin noticias y te muestro las que llevan ese tiempo en Aplicada.",
  },
]

const HowItWorksSection = () => {
  return (
    <section
      id="como-funciona"
      className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-12 px-4 py-24 sm:px-8"
    >
      <Reveal className="flex max-w-170 flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Cómo funciona en tres pasos
        </h2>
      </Reveal>
      <ol className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <Reveal delay={index * 100} className="h-full">
              <div className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <step.icon className="size-4 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-balance">
                  {step.title}
                </h3>
                <p className="text-base text-pretty text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default HowItWorksSection
