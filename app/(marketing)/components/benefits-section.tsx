import { LayoutDashboard, ListChecks, Lock, NotebookPen } from "lucide-react"
import Reveal from "./reveal"

const BENEFITS = [
  {
    icon: NotebookPen,
    title: "Todo de cada postulación en un solo lugar",
    description:
      "Guarda el título, la empresa, el enlace, la fuente, la modalidad, la fecha y tus notas. Sin buscar entre pestañas.",
  },
  {
    icon: ListChecks,
    title: "Sabes en qué etapa va cada proceso",
    description:
      "Mueve cada una entre Aplicada, Entrevista, Prueba técnica, Entrevista técnica y Oferta, y márcala como Rechazada, Retirada, Vacante cerrada, Oferta aceptada o Ignorada. Si te equivocas, deshaces el cambio.",
  },
  {
    icon: LayoutDashboard,
    title: "Un panel que te cuenta cómo vas",
    description:
      "Ves tus totales, cuántas postulaciones hay en cada etapa y las más recientes, sin armar fórmulas.",
  },
  {
    icon: Lock,
    title: "Tus datos son solo tuyos",
    description:
      "Solo tú ves tus postulaciones. El inicio de sesión lo maneja Clerk.",
  },
]

const BenefitsSection = () => {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-24 sm:px-8">
      <Reveal className="flex max-w-170 flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Lo que cambia cuando dejas la hoja de cálculo
        </h2>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2">
        {BENEFITS.map((benefit, index) => (
          <Reveal key={benefit.title} delay={index * 100} className="h-full">
            <div className="group flex h-full flex-col gap-4 rounded-2xl border bg-card p-6 transition-all duration-500 ease-fluid hover:-translate-y-1 hover:border-primary">
              <div className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <benefit.icon className="size-4" />
              </div>
              <h3 className="text-xl font-semibold text-balance">
                {benefit.title}
              </h3>
              <p className="text-base text-pretty text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default BenefitsSection
