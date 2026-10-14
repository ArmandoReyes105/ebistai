"use client"

import {
  JobApplicationFilters,
  clearFilters,
  parseFilters,
  serializeFilters,
} from "@/lib/domain/job-application-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef } from "react"

// URL is the single source of truth for filters, search, sort and pagination.
export function useJobApplicationFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const paramsKey = searchParams.toString()

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  // Debounced callers must not capture stale filters.
  const filtersRef = useRef(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const replace = useCallback(
    (next: JobApplicationFilters) => {
      const query = serializeFilters(next)
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [router, pathname]
  )

  // Any change other than `page` sends the user back to page 1.
  const update = useCallback(
    (patch: Partial<JobApplicationFilters>) => {
      const current = filtersRef.current
      const next = { ...current, ...patch }
      if (!("page" in patch)) next.page = 1
      filtersRef.current = next
      replace(next)
    },
    [replace]
  )

  const clear = useCallback(() => {
    const next = clearFilters(filtersRef.current)
    filtersRef.current = next
    replace(next)
  }, [replace])

  return { filters, update, clear }
}
