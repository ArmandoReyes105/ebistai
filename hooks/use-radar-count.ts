"use client"

import { asyncReducer, initialAsyncState } from "@/lib/domain/async-state"
import { statsService } from "@/services/stats-service"
import type { AsyncEvent, AsyncState } from "@/types/async-state.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useReducer, useRef } from "react"

const TIMEOUT_MS = 10_000

const reducer = (
  state: AsyncState<number>,
  event: AsyncEvent<number>
): AsyncState<number> => asyncReducer(state, event)

// Number of applications in the radar for the SAVED threshold. GET /stats
// computes the radar with the stored threshold, so its length is the answer.
// `refresh` is silent: call it after a configuration save.
export function useRadarCount() {
  const { getToken } = useAuth()
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    initialAsyncState<number>
  )
  // Latest request wins; unmount invalidates everything in flight.
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)

  const load = useCallback(
    async (silent: boolean) => {
      const requestId = ++requestIdRef.current
      const isCurrent = () =>
        mountedRef.current && requestId === requestIdRef.current
      try {
        const token = await getToken()
        const stats = await statsService.getDashboardStats({
          token: token ?? undefined,
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
        if (!isCurrent()) return
        const data = stats.antiGhostingRadar.length
        dispatch(
          silent ? { type: "refreshSucceeded", data } : { type: "loaded", data }
        )
      } catch (error) {
        // Stale or unmounted requests are dropped silently.
        if (!isCurrent()) return
        console.error(error)
        dispatch(
          silent ? { type: "refreshFailed", error } : { type: "failed", error }
        )
      }
    },
    [getToken]
  )

  useEffect(() => {
    mountedRef.current = true
    void load(false)
    return () => {
      mountedRef.current = false
    }
  }, [load])

  const refresh = useCallback(() => load(true), [load])

  return { state, refresh }
}
