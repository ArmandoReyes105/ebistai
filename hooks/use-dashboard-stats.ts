"use client"

import { asyncReducer, initialAsyncState } from "@/lib/domain/async-state"
import { afterIgnore, canStartIgnore } from "@/lib/domain/ignore-guard"
import { statsService } from "@/services/stats-service"
import type { AsyncEvent, AsyncState } from "@/types/async-state.types"
import type { DashboardStats } from "@/types/stats.types"
import { Status } from "@/types/enums"
import { useAuth } from "@clerk/nextjs"
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { useApplicationActions } from "./use-application-actions"

const TIMEOUT_MS = 10_000

const reducer = (
  state: AsyncState<DashboardStats>,
  event: AsyncEvent<DashboardStats>
): AsyncState<DashboardStats> => asyncReducer(state, event)

const initialState = (
  initialStats: DashboardStats | null
): AsyncState<DashboardStats> =>
  initialStats
    ? { status: "ready", data: initialStats }
    : initialAsyncState<DashboardStats>()

// State of GET /stats for the dashboard. The server page awaits it, so
// `initialStats` is normally present; null (server failure or timeout) makes
// the hook fetch once on mount. A timeout or failure shows the error state
// with "Reintentar". `refresh` is silent.
//
// `onActivityStale` is called whenever an application changed (ignore AND the
// "Deshacer" undo) or turned out stale, so the activity section reloads too.
export function useDashboardStats(
  initialStats: DashboardStats | null,
  onActivityStale: () => void
) {
  const { getToken } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialStats, initialState)
  // Rows removed locally after a successful ignore, until a refresh confirms.
  const [removedIds, setRemovedIds] = useState<ReadonlySet<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set())
  const inFlightRef = useRef(new Set<string>())
  // Latest request wins; unmount invalidates everything in flight.
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)
  const needsInitialFetchRef = useRef(initialStats === null)

  const load = useCallback(
    async (silent: boolean) => {
      const requestId = ++requestIdRef.current
      const isCurrent = () =>
        mountedRef.current && requestId === requestIdRef.current
      try {
        const token = await getToken()
        const data = await statsService.getDashboardStats({
          token: token ?? undefined,
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
        if (!isCurrent()) return
        // The server answer is the truth: locally removed rows are confirmed
        // gone (or restored by an undo).
        setRemovedIds((prev) => (prev.size === 0 ? prev : new Set()))
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
    if (needsInitialFetchRef.current) {
      needsInitialFetchRef.current = false
      void load(false)
    }
    return () => {
      mountedRef.current = false
    }
  }, [load])

  const retry = useCallback(() => {
    dispatch({ type: "retry" })
    void load(false)
  }, [load])

  const refresh = useCallback(() => load(true), [load])

  // Any change (ignore or its undo) and any stale signal reloads /stats and
  // the activity, silently.
  const refreshAll = useCallback(() => {
    void refresh()
    onActivityStale()
  }, [refresh, onActivityStale])

  const { changeStatus } = useApplicationActions({
    onApplicationChange: refreshAll,
    onStale: refreshAll,
  })

  const markAsIgnored = useCallback(
    async (id: string) => {
      if (!canStartIgnore(inFlightRef.current, id)) return
      inFlightRef.current.add(id)
      setPendingIds(new Set(inFlightRef.current))
      try {
        const ok = await changeStatus(id, Status.Ignored)
        const { removeRow } = afterIgnore(inFlightRef.current, id, ok)
        if (removeRow) setRemovedIds((prev) => new Set(prev).add(id))
      } finally {
        inFlightRef.current.delete(id)
        setPendingIds(new Set(inFlightRef.current))
      }
    },
    [changeStatus]
  )

  const visibleState = useMemo<AsyncState<DashboardStats>>(() => {
    if (state.status !== "ready" || removedIds.size === 0) return state
    return {
      status: "ready",
      data: {
        ...state.data,
        antiGhostingRadar: state.data.antiGhostingRadar.filter(
          (application) => !removedIds.has(application.id)
        ),
      },
    }
  }, [state, removedIds])

  return {
    state: visibleState,
    retry,
    refresh: refreshAll,
    markAsIgnored,
    pendingIds,
  }
}
