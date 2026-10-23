import { radioTargetIndex } from "@/lib/domain/config-settings"
import { useRef, type KeyboardEvent } from "react"

// Roving focus for a radiogroup: arrow keys, Home and End move focus between
// the radios. `onMove` lets cheap groups also select the focused radio.
export const useRovingRadios = (
  count: number,
  onMove?: (index: number) => void
) => {
  const radios = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown =
    (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
      const target = radioTargetIndex(index, event.key, count)
      if (target === null) return
      event.preventDefault()
      radios.current[target]?.focus()
      onMove?.(target)
    }

  const setRef = (index: number) => (element: HTMLButtonElement | null) => {
    radios.current[index] = element
  }

  return { onKeyDown, setRef }
}
