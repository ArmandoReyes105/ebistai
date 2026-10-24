import { LayoutDashboard, ListChecks, NotebookPen } from "lucide-react"
import Reveal from "./reveal"

const BENEFITS = [
  {
    icon: NotebookPen,
    title: "Todo de cada postulación en un solo lugar",
    description:
      "Título, empresa, enlace, fuente, modalidad, fecha y tus notas.",
  },
  {
    icon: ListChecks,
    title: "Etapas claras",
    description: "De Aplicada a Oferta, y si te equivocas, deshaces el cambio.",
  },
  {
    icon: LayoutDashboard,
    title: "Un panel que te cuenta cómo vas",
    description:
      "Tus totales, cada etapa y lo más reciente, sin armar fórmulas.",
  },
]

// Rendered inside the board section, right after the radar and stages.
const BoardBenefits = () => {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {BENEFITS.map((benefit, index) => (
        <li key={benefit.title}>
          <Reveal delay={index * 100} className="h-full">
            <article className="flex h-full flex-col gap-3 border bg-card p-6">
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center bg-muted"
              >
                <benefit.icon className="size-5" />
              </span>
              <h3 className="text-lg font-semibold text-balance">
                {benefit.title}
              </h3>
              <p className="text-sm text-pretty text-muted-foreground">
                {benefit.description}
              </p>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}

export default BoardBenefits
