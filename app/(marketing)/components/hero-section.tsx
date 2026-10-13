import HeroPreview from "./hero-preview"
import Reveal from "./reveal"
import SignupCta from "./signup-cta"

const HeroSection = () => {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-4 pt-24 pb-24 text-center sm:px-8">
      <div className="flex flex-col items-center gap-6">
        <Reveal className="flex flex-col items-center gap-6">
          <h1 className="max-w-170 bg-linear-to-r from-foreground to-muted-foreground bg-clip-text pb-1 text-4xl font-bold tracking-tight text-balance text-transparent sm:text-5xl lg:text-6xl">
            Deja el Excel. Ve toda tu búsqueda de trabajo en un solo lugar.
          </h1>
          <p className="max-w-170 text-lg text-pretty text-muted-foreground">
            Ebistai es un tablero visual para tus postulaciones. Registra cada
            una, muévela por etapas y deja que el radar te avise cuando una
            vacante se queda sin respuesta.
          </p>
        </Reveal>
        <Reveal delay={150} className="flex flex-col items-center gap-4">
          <SignupCta />
          <p className="max-w-md text-sm text-pretty text-muted-foreground">
            Nació de una búsqueda de trabajo real, la de quien lo creó, para
            dejar de depender de un Excel.
          </p>
        </Reveal>
      </div>
      <Reveal delay={300} className="flex w-full flex-col items-center gap-3">
        <HeroPreview />
        <p className="text-xs text-muted-foreground">
          Vista de ejemplo con datos ficticios.
        </p>
      </Reveal>
    </section>
  )
}

export default HeroSection
