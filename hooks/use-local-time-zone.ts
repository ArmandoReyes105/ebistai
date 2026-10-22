"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

const getSnapshot = () => Intl.DateTimeFormat().resolvedOptions().timeZone

// null on the server and during hydration, so nothing bucketed by local day is
// rendered until the browser zone is known (no hydration mismatch).
export function useLocalTimeZone(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}
