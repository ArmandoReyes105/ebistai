"use client"

import { toast } from "@/components/ui/toast"
import { jobApplicationService } from "@/services/job-application-service"
import { JobApplication } from "@/types/job-application.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useState } from "react"
import { useApplicationActions } from "./use-application-actions"

export function useJobApplications() {
  const { getToken } = useAuth()
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchJobApplications = useCallback(async () => {
    const token = await getToken()
    setIsLoading(true)

    try {
      const response = await jobApplicationService.getAll({
        token: token ?? undefined,
      })
      setJobApplications(response)
    } catch (error) {
      toast.add({
        title: "Error",
        description:
          "No se pudieron cargar las solicitudes de empleo. Por favor, inténtelo de nuevo más tarde.",
        type: "error",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  // Silent refresh: keeps the table on screen instead of flashing the loader.
  const refreshJobApplications = useCallback(async () => {
    try {
      const token = await getToken()
      const response = await jobApplicationService.getAll({
        token: token ?? undefined,
      })
      setJobApplications(response)
    } catch (error) {
      console.error(error)
    }
  }, [getToken])

  const replaceApplication = useCallback((updated: JobApplication) => {
    setJobApplications((prev) =>
      prev.map((app) => (app.id === updated.id ? updated : app))
    )
  }, [])

  const { changeStage, changeStatus, revive } = useApplicationActions({
    onApplicationChange: replaceApplication,
    onStale: refreshJobApplications,
  })

  const deleteApplication = async (id: string) => {
    const token = await getToken()
    const previous = jobApplications

    setJobApplications((prev) => prev.filter((a) => a.id !== id))

    try {
      setIsLoading(true)
      await jobApplicationService.delete(id, {
        token: token ?? undefined,
      })
    } catch (error) {
      setJobApplications(previous)
      toast.add({
        title: "Error",
        description: "No se pudo eliminar la solicitud. Inténtalo de nuevo.",
        type: "error",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(fetchJobApplications)
  }, [fetchJobApplications])

  return {
    jobApplications,
    isLoading,
    fetchJobApplications,
    deleteApplication,
    changeStage,
    changeStatus,
    revive,
  }
}
