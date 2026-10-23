"use client"

import { themeChoiceOf, type ThemeChoice } from "@/lib/domain/config-settings"
import { cn } from "cn"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { FOCUS_RING, LABEL, NARROW_TILE, TILE_TITLE } from "./styles"
import { useRovingRadios } from "./use-roving-radios"

const CHOICES: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
]

// The theme is unknown on the server: render unselected until hydrated.
const subscribe = () => () => {}
const useIsMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

// A tiny page drawn with one theme's tokens, whatever the active theme is
// (the "light" and "dark" classes re-scope the color variables).
const MiniPage = ({
  scheme,
  className,
}: {
  scheme: "light" | "dark"
  className?: string
}) => (
  <span
    className={cn(
      scheme,
      "relative block h-[52px] min-w-0",
      scheme === "light" ? "bg-muted" : "bg-background",
      className
    )}
  >
    <span className="absolute top-2 left-2 h-1.5 w-2/5 bg-foreground" />
    <span className="absolute top-5 left-2 h-[22px] w-3/5 border border-border bg-card" />
  </span>
)

const Preview = ({ value }: { value: ThemeChoice }) => {
  if (value === "system") {
    return (
      <span aria-hidden="true" className="flex border-b border-border">
        <MiniPage scheme="light" className="flex-1" />
        <MiniPage scheme="dark" className="flex-1" />
      </span>
    )
  }
  return (
    <span aria-hidden="true" className="block border-b border-border">
      <MiniPage scheme={value} />
    </span>
  )
}

const ThemeTile = () => {
  const { theme, setTheme } = useTheme()
  const mounted = useIsMounted()
  const current = mounted ? themeChoiceOf(theme) : null
  // Changing the theme is instant and free, so arrows also select.
  const { onKeyDown, setRef } = useRovingRadios(CHOICES.length, (index) =>
    setTheme(CHOICES[index].value)
  )

  return (
    <section aria-labelledby="theme-heading" className={NARROW_TILE}>
      <div className="flex flex-col gap-2.5">
        <span className={LABEL}>03 · Apariencia</span>
        <h2 id="theme-heading" className={TILE_TITLE}>
          Tema
        </h2>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="theme-heading"
        className="grid grid-cols-3 gap-2"
      >
        {CHOICES.map(({ value, label }, index) => {
          const isSelected = value === current

          return (
            <button
              key={value}
              ref={setRef(index)}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (current === null && index === 0) ? 0 : -1}
              onClick={() => setTheme(value)}
              onKeyDown={onKeyDown(index)}
              className={cn(
                "min-w-0 border bg-card text-left text-foreground",
                FOCUS_RING,
                isSelected ? "border-foreground" : "border-ramp-1"
              )}
            >
              <Preview value={value} />
              <span
                className={cn(
                  "block p-2.5 text-sm",
                  isSelected && "font-semibold"
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default ThemeTile
