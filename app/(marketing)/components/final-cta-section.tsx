import Reveal from "./reveal"
import SignupCta from "./signup-cta"

const FinalCtaSection = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-8">
      <Reveal className="flex flex-col items-center gap-8 text-center">
        <h2 className="max-w-170 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Tu próxima postulación ya puede tener su lugar
        </h2>
        <SignupCta />
      </Reveal>
    </section>
  )
}

export default FinalCtaSection
