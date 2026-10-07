"use client"

import { toast } from "@/components/ui/toast"
import { jobApplicationService } from "@/services/job-application-service"
import { statsService } from "@/services/stats-service"
import { Status } from "@/types/enums"
import { DashboardStats } from "@/types/stats.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useState } from "react"

export function useDashboardStats() {
  const { getToken } = useAuth()
  const [data, setData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDashboardStats = useCallback(async () => {
    const token = await getToken()
    setIsLoading(true)

    try {
      const result = await statsService.getDashboardStats({
        token: token ?? undefined,
      })
      setData(result)
    } catch (error) {
      toast.add({
        title: "Error",
        description:
          "Lo sentimos, ocurrió un error al recuperar su información.",
        type: "error",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  const markAsIgnored = async (id: string) => {
    const token = await getToken()
    const removed = data?.antiGhostingRadar.find((a) => a.id === id)

    setData((prev) =>
      prev
        ? {
            ...prev,
            antiGhostingRadar: prev.antiGhostingRadar.filter(
              (a) => a.id !== id
            ),
          }
        : prev
    )

    try {
      await jobApplicationService.updateStatus(
        id,
        { status: Status.Ignored },
        { token: token ?? undefined }
      )

      toast.add({
        description: "Postulación marcada como ignorada.",
        type: "success",
      })
    } catch (error) {
      // Restore only the failed item so concurrent removals are preserved
      if (removed) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                antiGhostingRadar: [...prev.antiGhostingRadar, removed],
              }
            : prev
        )
      }
      toast.add({
        title: "Error",
        description: "No se pudo actualizar el estado. Inténtalo de nuevo.",
        type: "error",
      })
      console.error(error)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(fetchDashboardStats)
  }, [fetchDashboardStats])

  return { data, isLoading, fetchDashboardStats, markAsIgnored }
}
