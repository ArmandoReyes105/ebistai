"use client"

import { asyncReducer, initialAsyncState } from "@/lib/domain/async-state"
import { statsService } from "@/services/stats-service"
import type { AsyncEvent, AsyncState } from "@/types/async-state.types"
import type { ActivityStats } from "@/types/stats.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useReducer, useRef } from "react"

const TIMEOUT_MS = 10_000

const reducer = (
  state: AsyncState<ActivityStats>,
  event: AsyncEvent<ActivityStats>
): AsyncState<ActivityStats> => asyncReducer(state, event)

// Activity arrives as a promise streamed from the server page (it never
// rejects: null means the server fetch failed or timed out). A null result
// triggers ONE client fetch; if that also fails the section shows its error
// state and "Reintentar". `refresh` is silent: it keeps what is on screen
// when it fails.
export function useActivityStats(
  initialActivity: Promise<ActivityStats | null>
) {
  const { getToken } = useAuth()
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    initialAsyncState<ActivityStats>
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
        const data = await statsService.getActivity({
          token: token ?? undefined,
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
        if (!isCurrent()) return
        dispatch(
          silent ? { type: "refreshSucceeded", data } : { type: "loaded", data }
        )
      } catch (error) {
        console.error(error)
        if (!isCurrent()) return
        dispatch(
          silent ? { type: "refreshFailed", error } : { type: "failed", error }
        )
      }
    },
    [getToken]
  )

  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    void initialActivity.then((data) => {
      if (cancelled) return
      if (data) {
        // A server result supersedes anything still in flight.
        requestIdRef.current++
        dispatch({ type: "loaded", data })
      } else {
        void load(false)
      }
    })

    return () => {
      cancelled = true
      mountedRef.current = false
    }
  }, [initialActivity, load])

  const retry = useCallback(() => {
    dispatch({ type: "retry" })
    void load(false)
  }, [load])

  const refresh = useCallback(() => load(true), [load])

  return { state, retry, refresh }
}
