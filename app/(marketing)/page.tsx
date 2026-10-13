import type { Metadata } from "next"
import BenefitsSection from "./components/benefits-section"
import ComingSoonSection from "./components/coming-soon-section"
import FinalCtaSection from "./components/final-cta-section"
import HeroSection from "./components/hero-section"
import HowItWorksSection from "./components/how-it-works-section"
import ProblemSection from "./components/problem-section"
import RadarSection from "./components/radar-section"
import TaglineRevealSection from "./components/tagline-reveal-section"

const TITLE = "Ebistai: controla tus postulaciones y detecta el ghosting"
const DESCRIPTION =
  "Deja el Excel. Registra tus postulaciones, muévelas por etapas y deja que el radar te avise cuáles se quedaron sin respuesta. Beta privada y gratis."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Ebistai",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
}

const LandingPage = () => {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <BenefitsSection />
      <HowItWorksSection />
      <TaglineRevealSection />
      <RadarSection />
      <ComingSoonSection />
      <FinalCtaSection />
    </>
  )
}

export default LandingPage
