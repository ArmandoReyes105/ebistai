// Pure helpers for the configuration page.

export const THRESHOLD_OPTIONS = [14, 21, 25, 30, 45] as const

const clampPercent = (value: number): number =>
  Math.min(100, Math.max(0, value))

// Position of a threshold button along the day ruler, 0..100 with one
// decimal. The ruler is proportional: the longest option sits at the end.
export const rulerPercent = (
  days: number,
  options: readonly number[] = THRESHOLD_OPTIONS
): number => {
  const longest = Math.max(0, ...options)
  if (longest === 0) return 0
  return Math.round(clampPercent((days / longest) * 100) * 10) / 10
}

// Target of a keyboard move inside a radiogroup (roving focus), or null when
// the key does not move anything.
export const radioTargetIndex = (
  current: number,
  key: string,
  count: number
): number | null => {
  if (count <= 0) return null
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (current + 1) % count
    case "ArrowLeft":
    case "ArrowUp":
      return (current - 1 + count) % count
    case "Home":
      return 0
    case "End":
      return count - 1
    default:
      return null
  }
}

export const autoIgnoreLabel = (enabled: boolean): string =>
  enabled ? "Encendido" : "Apagado"

export type ThemeChoice = "light" | "dark" | "system"

export const themeChoiceOf = (value: string | undefined): ThemeChoice =>
  value === "light" || value === "dark" ? value : "system"

// First letter of the name (or the email) for the square avatar.
export const avatarInitial = (
  name: string | null | undefined,
  email: string | null | undefined
): string => {
  const source = name?.trim() || email?.trim()
  return source ? source.charAt(0).toUpperCase() : "?"
}
