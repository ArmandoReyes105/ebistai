import HeroChat from "./hero-chat"
import Reveal from "./reveal"
import SignupCta from "./signup-cta"

const HeroSection = () => {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-32 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:pt-40 lg:pb-24"
    >
      <Reveal className="flex flex-col gap-6">
        <span className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
          <span aria-hidden="true" className="size-2 bg-primary" />
          Servidor MCP · funciona con Claude
        </span>
        <h1
          id="hero-title"
          className="max-w-170 bg-linear-to-r from-foreground to-muted-foreground bg-clip-text pb-1 text-4xl font-semibold tracking-tight text-balance text-transparent sm:text-5xl lg:text-6xl"
        >
          Pregúntale a tu IA cómo va tu búsqueda de trabajo
          <span className="text-primary-text">.</span>
        </h1>
        <p className="max-w-170 text-base text-pretty text-muted-foreground sm:text-lg">
          Ebistai guarda cada postulación con su historial y la conecta con tu
          propia IA. Pregúntale qué vacantes se quedaron en silencio, cómo vas
          este mes o pídele que registre una vacante desde su enlace.
        </p>
        <div className="border-t border-foreground pt-6">
          <SignupCta />
        </div>
      </Reveal>
      <Reveal delay={150}>
        <HeroChat />
      </Reveal>
    </section>
  )
}

export default HeroSection
