"use client"

import { useLayoutEffect, useRef } from "react"

const LINES = [
  "Buscar trabajo ya cansa bastante.",
  "Que llevar la cuenta no sea otra carga.",
  "Cada postulación en su lugar y cada silencio a la vista.",
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
      className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-8"
    >
      <p
        ref={rootRef}
        className="group max-w-170 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl lg:text-6xl"
      >
        {LINES.map((line) => (
          <span key={line} className="block pb-4">
            {line.split(" ").map((word, index) => (
              <span key={`${word}-${index}`}>
                <span
                  data-word
                  className="duration-700 ease-fluid group-data-[ready=true]:transition-colors data-[active=false]:text-foreground/30"
                >
                  {word}
                </span>{" "}
              </span>
            ))}
          </span>
        ))}
      </p>
    </section>
  )
}

export default TaglineRevealSection
