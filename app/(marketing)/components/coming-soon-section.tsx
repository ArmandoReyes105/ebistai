import { Badge } from "@/components/ui/badge"
import { Plug } from "lucide-react"
import Reveal from "./reveal"

const ComingSoonSection = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-8">
      <Reveal>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
          <Badge variant="outline">
            <Plug /> Próximamente
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Conecta tu búsqueda con tu propia IA
          </h2>
          <p className="max-w-xl text-base text-pretty text-muted-foreground">
            Estamos preparando una conexión MCP para que puedas analizar tu
            búsqueda con tu propia IA, como Claude o ChatGPT. Todavía no hay
            fecha, pero cuando esté lista te lo cuento aquí.
          </p>
        </div>
      </Reveal>
    </section>
  )
}

export default ComingSoonSection
