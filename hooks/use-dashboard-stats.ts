"use client"

import { toast } from "@/components/ui/toast"
import { statsService } from "@/services/stats-service"
import { Status } from "@/types/enums"
import { JobApplication } from "@/types/job-application.types"
import { DashboardStats } from "@/types/stats.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useState } from "react"
import { useApplicationActions } from "./use-application-actions"

export function useDashboardStats() {
  const { getToken } = useAuth()
  const [data, setData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadStats = useCallback(async () => {
    const token = await getToken()
    return statsService.getDashboardStats({ token: token ?? undefined })
  }, [getToken])

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true)

    try {
      setData(await loadStats())
    } catch (error) {
      toast.add({
        title: "Uy",
        description:
          "Se nos atoró algo al traer tu resumen. ¿Lo intentamos de nuevo en un ratito?",
        type: "error",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [loadStats])

  // Silent refresh: keeps the dashboard on screen while data reloads.
  const refreshDashboardStats = useCallback(async () => {
    try {
      setData(await loadStats())
    } catch (error) {
      console.error(error)
    }
  }, [loadStats])

  // Drop the item from the radar right away when it is no longer active,
  // then reload so the counters and recent list stay in sync (also on undo).
  const handleApplicationChange = useCallback(
    (application: JobApplication) => {
      if (application.status !== Status.Active) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                antiGhostingRadar: prev.antiGhostingRadar.filter(
                  (a) => a.id !== application.id
                ),
              }
            : prev
        )
      }
      void refreshDashboardStats()
    },
    [refreshDashboardStats]
  )

  const { changeStatus } = useApplicationActions({
    onApplicationChange: handleApplicationChange,
    onStale: refreshDashboardStats,
  })

  const markAsIgnored = async (id: string) => {
    await changeStatus(id, Status.Ignored)
  }

  useEffect(() => {
    void Promise.resolve().then(fetchDashboardStats)
  }, [fetchDashboardStats])

  return {
    data,
    isLoading,
    fetchDashboardStats,
    refreshDashboardStats,
    markAsIgnored,
  }
}
