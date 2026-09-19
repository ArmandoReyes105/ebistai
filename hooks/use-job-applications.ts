"use client"

import { toast } from "@/components/ui/toast"
import { jobApplicationService } from "@/services/job-application-service"
import { Stage, Status } from "@/types/enums"
import { JobApplication } from "@/types/job-application.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useState } from "react"

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

  const updateStatus = async (id: string, status: Status) => {
    const token = await getToken()
    const previous = jobApplications

    setJobApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: status } : app))
    )

    try {
      await jobApplicationService.updateStatus(
        id,
        { status: status },
        { token: token ?? undefined }
      )
    } catch (error) {
      setJobApplications(previous)
      toast.add({
        title: "Error",
        description: "No se pudo actualizar el estado. Inténtalo de nuevo.",
        type: "error",
      })
      console.error(error)
    }
  }

  const updateStage = async (id: string, newStage: Stage) => {
    const token = await getToken()
    const previous = jobApplications

    setJobApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, stage: newStage } : app))
    )

    try {
      await jobApplicationService.updateStage(
        id,
        { stage: newStage },
        { token: token ?? undefined }
      )
    } catch (error) {
      setJobApplications(previous)
      toast.add({
        title: "Error",
        description: "No se pudo actualizar la etapa. Inténtalo de nuevo.",
        type: "error",
      })
      console.error(error)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(fetchJobApplications)
  }, [fetchJobApplications])

  return { jobApplications, isLoading, fetchJobApplications, deleteApplication, updateStatus, updateStage}
}
