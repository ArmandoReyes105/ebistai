import type { Metadata } from "next"
import AsksSection from "./components/asks-section"
import FinalCtaSection from "./components/final-cta-section"
import HeroSection from "./components/hero-section"
import HowItWorksSection from "./components/how-it-works-section"
import ProblemSection from "./components/problem-section"
import RadarSection from "./components/radar-section"
import TaglineRevealSection from "./components/tagline-reveal-section"
import TrustSection from "./components/trust-section"

const TITLE = "Ebistai: pregúntale a tu IA cómo va tu búsqueda de trabajo"
const DESCRIPTION =
  "Ebistai guarda cada postulación con su historial y la conecta con tu propia IA por MCP. Pregúntale qué vacantes se quedaron en silencio. Beta privada y gratis."

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
      <AsksSection />
      <HowItWorksSection />
      <TaglineRevealSection />
      <TrustSection />
      <RadarSection />
      <FinalCtaSection />
    </>
  )
}

export default LandingPage
