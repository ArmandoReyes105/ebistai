import Reveal from "./reveal"
import SignupCta from "./signup-cta"

const FinalCtaSection = () => {
  return (
    <section
      aria-labelledby="final-title"
      className="mt-8 bg-foreground text-background"
    >
      <Reveal className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
        <h2
          id="final-title"
          className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
        >
          Dale a tu IA el contexto de tu búsqueda
          <span className="text-primary">.</span>
        </h2>
        <SignupCta tone="inverted" />
      </Reveal>
    </section>
  )
}

export default FinalCtaSection
