"use client"

import { useLayoutEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const LINES = [
  { text: "Buscar trabajo ya cansa bastante.", highlight: false },
  {
    text: "Tu IA ya sabe analizar. Ebistai le da qué analizar.",
    highlight: false,
  },
  {
    text: "Cada postulación en su lugar y cada silencio a la vista.",
    highlight: true,
  },
]

// Words go from muted to full color, one at a time, as they cross a trigger
// line at 60% of the viewport height. Scrolling back up mutes them again.
//
// Progressive enhancement: the server HTML renders every word in full color.
// Before first paint a layout effect sets each word's data-active state
// straight on the DOM (no React state), then an IntersectionObserver keeps it
// in sync. Reduced motion or no IntersectionObserver leaves the text static.
const TaglineRevealSection = () => {
  const rootRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const words = root.querySelectorAll<HTMLElement>("[data-word]")
    const triggerLine = window.innerHeight * 0.6
    words.forEach((word) => {
      word.dataset.active = String(
        word.getBoundingClientRect().top < triggerLine
      )
    })
    // Enable the color transition only after the initial state is painted.
    const frame = requestAnimationFrame(() => {
      root.dataset.ready = "true"
    })

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement
          const passed =
            entry.isIntersecting ||
            entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0)
          target.dataset.active = String(passed)
        }
      },
      { rootMargin: "0px 0px -40% 0px" }
    )
    words.forEach((word) => observer.observe(word))
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <section
      aria-label="Lo que buscamos contigo"
      className="my-16 bg-primary text-primary-foreground sm:my-24"
    >
      <div
        aria-hidden="true"
        className="landing-hatch h-12 border-b-2 border-primary-foreground sm:h-14"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-8 sm:py-24">
        <span className="font-mono text-xs tracking-wider uppercase">
          Lo que buscamos contigo
        </span>
        <p
          ref={rootRef}
          className="group flex max-w-5xl flex-col items-start gap-2 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl lg:text-6xl"
        >
          {LINES.map((line) => (
            <span
              key={line.text}
              className={cn(line.highlight && "bg-primary-foreground px-3")}
            >
              {line.text.split(" ").map((word, index) => (
                <span key={`${word}-${index}`}>
                  <span
                    data-word
                    className={cn(
                      "duration-700 ease-fluid group-data-[ready=true]:transition-colors",
                      line.highlight
                        ? "text-primary data-[active=false]:text-primary/30"
                        : "data-[active=false]:text-primary-foreground/30"
                    )}
                  >
                    {word}
                  </span>{" "}
                </span>
              ))}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

export default TaglineRevealSection
