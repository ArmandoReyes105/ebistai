import { CircleCheck, Lock, PlugZap, ShieldCheck } from "lucide-react"
import Reveal from "./reveal"

const TILES = [
  {
    icon: Lock,
    title: "Tú autorizas la conexión",
    description:
      "Tu IA entra con tu permiso, con el mismo inicio de sesión de tu cuenta.",
  },
  {
    icon: ShieldCheck,
    title: "Solo ve tus datos",
    description: "Tu IA solo accede a tus postulaciones. Nadie más las ve.",
  },
  {
    icon: CircleCheck,
    title: "Sin IA propia",
    description: "Ebistai no tiene una IA integrada. La IA la pones tú.",
  },
  {
    icon: PlugZap,
    title: "Funciona con Claude",
    description: "En la beta la conexión funciona con Claude.",
  },
]

const TrustSection = () => {
  return (
    <section
      aria-labelledby="trust-title"
      className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-3"
    >
      <Reveal className="h-full">
        <div className="flex h-full min-h-64 flex-col justify-between gap-6 bg-foreground p-6 text-background sm:p-8">
          <span className="font-mono text-xs tracking-wider text-background/70 uppercase">
            04 · Tus datos, tu permiso
          </span>
          <h2
            id="trust-title"
            className="text-3xl font-semibold tracking-tight text-balance lg:text-4xl"
          >
            Usas la IA que ya tienes. Ebistai no trae una propia
            <span className="text-primary">.</span>
          </h2>
        </div>
      </Reveal>
      <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        {TILES.map((tile, index) => (
          <li key={tile.title}>
            <Reveal delay={(index % 2) * 100} className="h-full">
              <article className="flex h-full flex-col gap-3 border bg-card p-6">
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center bg-muted"
                >
                  <tile.icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{tile.title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  {tile.description}
                </p>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TrustSection
