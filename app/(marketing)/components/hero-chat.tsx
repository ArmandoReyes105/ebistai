import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type ChatMessage = {
  from: "user" | "ai"
  text: string
  tool?: string
}

const MESSAGES: ChatMessage[] = [
  {
    from: "user",
    text: "¿Qué postulaciones llevan más de 21 días sin respuesta?",
  },
  {
    from: "ai",
    tool: "get_radar",
    text: "Dos: Desarrolladora frontend en Taller Lumbre (31 días) e Ingeniero full stack en Nube Cobre (27 días). ¿Quieres preparar un seguimiento?",
  },
  {
    from: "user",
    text: "Registra esta vacante: [enlace de la vacante]",
  },
  {
    from: "ai",
    tool: "create_application",
    text: "Listo. Registré Diseñadora de producto en Faro Norte, en la etapa Aplicada.",
  },
]

// Static sample conversation. The "dark" class re-scopes the theme tokens so
// the terminal stays dark in both themes without hard coded colors.
const HeroChat = () => {
  return (
    <figure className="dark flex flex-col border bg-background text-foreground">
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
          <span aria-hidden="true" className="size-2 bg-primary" />
          Tu IA · conectada a Ebistai
        </span>
        <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          MCP
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        {MESSAGES.map((message) => (
          <div
            key={message.text}
            className={cn(
              "flex flex-col gap-2",
              message.from === "user" ? "items-end" : "items-start"
            )}
          >
            <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              {message.from === "user" ? "Tú" : "Tu IA"}
            </span>
            {message.tool ? (
              <span className="flex items-center gap-2 border px-2 py-1 font-mono text-xs tracking-wider uppercase">
                <Check aria-hidden="true" className="size-3 text-primary" />
                {message.tool}
              </span>
            ) : null}
            <p
              className={cn(
                "max-w-md px-4 py-3 text-sm text-pretty sm:text-base",
                message.from === "user"
                  ? "bg-foreground text-background"
                  : "bg-card text-card-foreground"
              )}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <figcaption className="border-t px-4 py-3 font-mono text-xs tracking-wider text-muted-foreground uppercase sm:px-6">
        Conversación de ejemplo con datos ficticios.
      </figcaption>
    </figure>
  )
}

export default HeroChat
