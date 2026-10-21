"use client"

import {
  DEFAULT_FILTERS,
  PAGE_SIZES,
  toApiQuery,
} from "@/lib/domain/job-application-query"
import { jobApplicationService } from "@/services/job-application-service"
import { statsService } from "@/services/stats-service"
import { JobApplication } from "@/types/job-application.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useState } from "react"

const COUNT_PAGE_SIZE = PAGE_SIZES[0]

const countQuery = (state: "active" | "closed") =>
  toApiQuery({
    ...DEFAULT_FILTERS,
    state,
    page: 1,
    pageSize: COUNT_PAGE_SIZE,
  })

interface Summary {
  attention: JobApplication[] | null
  activeCount: number | null
  closedCount: number | null
  thresholdDays: number | null
}

const EMPTY: Summary = {
  attention: null,
  activeCount: null,
  closedCount: null,
  thresholdDays: null,
}

// Numbers for the list's summary tiles. Silent by design: a failed request
// leaves its value as null (no toast); the tiles render "—".
export function useApplicationsSummary() {
  const { getToken } = useAuth()
  const [summary, setSummary] = useState<Summary>(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      let token: string | undefined
      try {
        token = (await getToken()) ?? undefined
      } catch (error) {
        console.error(error)
      }

      const [stats, active, closed] = await Promise.allSettled([
        statsService.getDashboardStats({ token }),
        jobApplicationService.getPage(countQuery("active"), { token }),
        jobApplicationService.getPage(countQuery("closed"), { token }),
      ])
      // A newer request (or unmount) owns the state now.
      if (cancelled) return

      for (const r of [stats, active, closed]) {
        if (r.status === "rejected") console.error(r.reason)
      }

      // On a refresh, a failed request keeps the last known value.
      setSummary((prev) => ({
        attention:
          stats.status === "fulfilled"
            ? stats.value.antiGhostingRadar
            : prev.attention,
        thresholdDays:
          stats.status === "fulfilled"
            ? stats.value.radarGhostingThresholdDays
            : prev.thresholdDays,
        activeCount:
          active.status === "fulfilled"
            ? active.value.totalCount
            : prev.activeCount,
        closedCount:
          closed.status === "fulfilled"
            ? closed.value.totalCount
            : prev.closedCount,
      }))
      setIsLoading(false)
    }
    void load()

    return () => {
      // Ignore in-flight work when deps change or on unmount.
      cancelled = true
    }
  }, [getToken, reloadToken])

  return { ...summary, isLoading, reload }
}
