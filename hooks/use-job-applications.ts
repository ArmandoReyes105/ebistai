"use client"

import { toast } from "@/components/ui/toast"
import {
  JobApplicationFilters,
  toApiQuery,
} from "@/lib/domain/job-application-query"
import { jobApplicationService } from "@/services/job-application-service"
import { JobApplication, PagedResult } from "@/types/job-application.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useRef, useState } from "react"
import { useApplicationActions } from "./use-application-actions"

interface UseJobApplicationsOptions {
  filters: JobApplicationFilters
  // Called when a delete leaves a page > 1 empty, so the view can step back.
  onPageEmptied?: () => void
  // Called after any server-confirmed change to an application (stage,
  // status, revive, or an undo from the toast), e.g. to refresh totals.
  onApplicationChanged?: () => void
}

export function useJobApplications({
  filters,
  onPageEmptied,
  onApplicationChanged,
}: UseJobApplicationsOptions) {
  const { getToken } = useAuth()
  const query = toApiQuery(filters)

  // The previous result stays in `data` while the next one loads.
  const [data, setData] = useState<PagedResult<JobApplication> | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)

  const onPageEmptiedRef = useRef(onPageEmptied)
  const onApplicationChangedRef = useRef(onApplicationChanged)
  useEffect(() => {
    onPageEmptiedRef.current = onPageEmptied
    onApplicationChangedRef.current = onApplicationChanged
  })

  // Refetches the current view (create, conflict, empty page after delete).
  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    // Aborting makes sure a slow, stale response can never overwrite a newer one.
    const controller = new AbortController()

    const load = async () => {
      try {
        const token = await getToken()
        if (controller.signal.aborted) return
        setIsFetching(true)
        const response = await jobApplicationService.getPage(query, {
          token: token ?? undefined,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setData(response)
        setIsFetching(false)
      } catch (error) {
        if (controller.signal.aborted) return
        setIsFetching(false)
        toast.add({
          title: "Uy",
          description:
            "Se nos atoró algo al traer tus postulaciones. ¿Lo intentamos de nuevo en un ratito?",
          type: "error",
        })
        console.error(error)
      }
    }
    void load()

    return () => controller.abort()
  }, [getToken, query, reloadToken])

  // In-place update from a server response: no refetch, rows never jump.
  const replaceApplication = useCallback((updated: JobApplication) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((app) =>
              app.id === updated.id ? updated : app
            ),
          }
        : prev
    )
  }, [])

  const handleApplicationChange = useCallback(
    (updated: JobApplication) => {
      replaceApplication(updated)
      onApplicationChangedRef.current?.()
    },
    [replaceApplication]
  )

  const { changeStage, changeStatus, revive } = useApplicationActions({
    onApplicationChange: handleApplicationChange,
    onStale: reload,
  })

  const deleteApplication = async (id: string) => {
    const previous = data
    if (!previous) return

    const removedIndex = previous.items.findIndex((a) => a.id === id)
    const removed = previous.items[removedIndex]
    const remaining = previous.items.filter((a) => a.id !== id)
    setData({
      ...previous,
      items: remaining,
      totalCount: Math.max(0, previous.totalCount - 1),
    })

    try {
      const token = await getToken()
      await jobApplicationService.delete(id, { token: token ?? undefined })
      if (remaining.length === 0) {
        if (previous.page > 1) onPageEmptiedRef.current?.()
        else reload()
      }
    } catch (error) {
      // Re-insert only the removed row, so changes that landed meanwhile are kept.
      if (removed) {
        setData((current) => {
          if (!current || current.items.some((a) => a.id === id)) return current
          const items = [...current.items]
          items.splice(Math.min(removedIndex, items.length), 0, removed)
          return { ...current, items, totalCount: current.totalCount + 1 }
        })
      }
      toast.add({
        title: "Uy",
        description: "No pudimos eliminar la postulación. ¿Le damos otra vez?",
        type: "error",
      })
      console.error(error)
    }
  }

  return {
    data,
    // Skeleton only before the very first response.
    isInitialLoading: data === null && isFetching,
    isFetching,
    reload,
    replaceApplication,
    deleteApplication,
    changeStage,
    changeStatus,
    revive,
  }
}
