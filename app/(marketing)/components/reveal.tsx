"use client"

import { useLayoutEffect, useRef } from "react"
import { cn } from "@/lib/utils"

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Stagger delay in milliseconds. */
  delay?: number
}

// Heavy fade up as the element enters the viewport.
//
// Progressive enhancement: the server HTML is fully visible. Before first
// paint on the client, a layout effect arms elements that are below the fold
// by setting data-reveal="hidden" directly on the DOM node (no React state, so
// no extra render and no flash). An IntersectionObserver flips it to "shown".
// Elements already in view, reduced motion and missing IntersectionObserver
// all leave the content untouched.
const Reveal = ({ children, className, delay = 0 }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (node.getBoundingClientRect().top < window.innerHeight) return

    node.dataset.reveal = "hidden"
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        node.style.transitionDelay = `${delay}ms`
        node.dataset.reveal = "shown"
        observer.disconnect()
      },
      { threshold: 0.15 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        "data-[reveal]:transition-all data-[reveal]:duration-1000 data-[reveal]:ease-fluid data-[reveal=hidden]:translate-y-16 data-[reveal=hidden]:opacity-0 data-[reveal=hidden]:blur-md",
        className
      )}
    >
      {children}
    </div>
  )
}

export default Reveal
