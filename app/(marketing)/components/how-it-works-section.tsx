import { Link2, MessageSquare, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import Reveal from "./reveal"
import SectionHeader from "./section-header"

const STEPS = [
  {
    icon: UserPlus,
    title: "Crea tu cuenta",
    description:
      "Entra a la beta y registra tus postulaciones desde el tablero, o deja que tu IA las registre después.",
  },
  {
    icon: Link2,
    title: "Conecta Claude",
    description:
      "Agrega Ebistai como conector en Claude y autoriza el acceso con tu cuenta.",
  },
  {
    icon: MessageSquare,
    title: "Pregunta",
    description:
      "Pídele análisis, resúmenes o que registre vacantes nuevas. Tú decides qué hacer con la respuesta.",
  },
]

const HowItWorksSection = () => {
  return (
    <section
      id="como-funciona"
      aria-labelledby="how-title"
      className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-4 py-16 sm:px-8 sm:py-24"
    >
      <Reveal>
        <SectionHeader
          eyebrow="03 · Cómo funciona"
          titleId="how-title"
          title="Conecta tu IA en tres pasos"
        />
      </Reveal>
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => {
          const last = index === STEPS.length - 1
          return (
            <li key={step.title}>
              <Reveal delay={index * 100} className="h-full">
                <div
                  className={cn(
                    "flex h-full flex-col gap-4 border-t-2 pt-6",
                    last ? "border-primary" : "border-foreground"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "text-7xl leading-none font-medium tracking-tighter",
                        last && "text-primary-text"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <step.icon
                      aria-hidden="true"
                      className="size-6 text-muted-foreground"
                    />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    <span className="sr-only">Paso {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="text-base text-pretty text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default HowItWorksSection
