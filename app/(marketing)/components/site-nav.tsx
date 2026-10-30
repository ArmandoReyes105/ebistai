"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs"
import TaiFigure from "@/components/tai/tai-figure"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/#preguntale", label: "Qué le preguntas" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#radar", label: "Radar" },
]

const BAR =
  "absolute h-0.5 w-6 bg-foreground transition-all duration-700 ease-fluid"
const STAGGER = ["delay-100", "delay-150", "delay-200", "delay-300"]

// Flat top bar that mirrors the app header: square edges, bottom rule and
// Tai as the logo. On mobile the hamburger morphs into an X and opens a full
// screen glass overlay.
const SiteNav = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-8">
          <Link
            href="/"
            onClick={close}
            aria-label="Ebistai, ir al inicio"
            className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* Tai, the app's mascot, doubles as the logo. */}
            <TaiFigure
              pose="neutral"
              outlined={false}
              tight
              idle="blink"
              className="w-7"
            />
            <span className="text-xl font-bold tracking-tight">Ebistai</span>
          </Link>

          <ul className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-300 ease-fluid outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Show when="signed-out">
            <div className="hidden items-center gap-2 lg:flex">
              <SignInButton>
                <Button
                  variant="ghost"
                  className="h-9 px-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:h-11"
                >
                  Iniciar sesión
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="h-9 px-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:h-11">
                  Registrarse
                </Button>
              </SignUpButton>
            </div>
          </Show>

          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
            className="relative ml-auto flex size-10 items-center justify-center transition-colors duration-300 ease-fluid outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <span className={cn(BAR, open ? "rotate-45" : "-translate-y-2")} />
            <span
              className={cn(BAR, open ? "scale-x-0 opacity-0" : "opacity-100")}
            />
            <span className={cn(BAR, open ? "-rotate-45" : "translate-y-2")} />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        inert={!open}
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-background/80 backdrop-blur-3xl transition-all duration-700 ease-fluid lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <ul className="flex flex-col items-center gap-6">
          {NAV_LINKS.map((link, index) => (
            <li
              key={link.href}
              className={cn(
                "transition-all duration-700 ease-fluid",
                STAGGER[index],
                open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              )}
            >
              <Link
                href={link.href}
                onClick={close}
                className="px-3 py-2 text-3xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Show when="signed-out">
          <div
            className={cn(
              "flex items-center gap-2 transition-all delay-300 duration-700 ease-fluid",
              open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            )}
          >
            <SignInButton>
              <Button
                variant="outline"
                onClick={close}
                className="h-9 px-3 text-base font-semibold focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:h-11"
              >
                Iniciar sesión
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button
                onClick={close}
                className="h-9 px-3 text-base font-semibold focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:h-11"
              >
                Registrarse
              </Button>
            </SignUpButton>
          </div>
        </Show>
      </div>
    </>
  )
}

export default SiteNav
