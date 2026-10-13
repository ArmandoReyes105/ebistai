"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#radar", label: "Radar" },
]

const BAR = "absolute h-0.5 w-6 bg-foreground transition-all duration-700 ease-fluid"
const STAGGER = ["delay-100", "delay-150", "delay-200", "delay-300"]

// Floating island nav. The pill stays detached from the top; on mobile the
// hamburger morphs into an X and opens a full screen glass overlay.
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
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4"
      >
        <div className="pointer-events-auto mt-6 flex w-max max-w-full items-center gap-6 rounded-full border bg-background/70 py-2 pr-2 pl-4 backdrop-blur-xl">
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image src="/koi.png" alt="Ebistai" width={24} height={24} />
            <span className="text-base font-semibold">Ebistai</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 ease-fluid outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Show when="signed-out">
            <div className="hidden items-center gap-2 md:flex">
              <SignInButton>
                <Button
                  variant="ghost"
                  className="h-auto rounded-full px-3 py-2 text-sm font-semibold duration-300 ease-fluid focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Iniciar sesión
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="h-auto rounded-full px-3 py-2 text-sm font-semibold duration-300 ease-fluid focus-visible:ring-2 focus-visible:ring-ring">
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
            className="relative flex size-10 items-center justify-center rounded-full outline-none transition-all duration-300 ease-fluid hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:scale-95 md:hidden"
          >
            <span
              className={cn(BAR, open ? "rotate-45" : "-translate-y-2")}
            />
            <span
              className={cn(BAR, open ? "scale-x-0 opacity-0" : "opacity-100")}
            />
            <span
              className={cn(BAR, open ? "-rotate-45" : "translate-y-2")}
            />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        inert={!open}
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-background/80 backdrop-blur-3xl transition-all duration-700 ease-fluid md:hidden",
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
                className="rounded-full px-3 py-2 text-3xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="h-auto rounded-full px-3 py-2 text-base font-semibold focus-visible:ring-2 focus-visible:ring-ring"
              >
                Iniciar sesión
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button
                onClick={close}
                className="h-auto rounded-full px-3 py-2 text-base font-semibold focus-visible:ring-2 focus-visible:ring-ring"
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
