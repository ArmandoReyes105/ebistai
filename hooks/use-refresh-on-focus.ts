"use client"

import { useEffect, useRef } from "react"

const DEFAULT_MIN_INTERVAL_MS = 60_000

// Calls `callback` when the tab becomes visible again, at most once per
// `minIntervalMs`. Meant for silent refreshes of on-screen data.
export function useRefreshOnFocus(
  callback: () => void,
  minIntervalMs: number = DEFAULT_MIN_INTERVAL_MS
) {
  const callbackRef = useRef(callback)
  const lastRunRef = useRef(0)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    lastRunRef.current = Date.now()

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return
      const now = Date.now()
      if (now - lastRunRef.current < minIntervalMs) return
      lastRunRef.current = now
      callbackRef.current()
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [minIntervalMs])
}
