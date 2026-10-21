"use client"

import { toast } from "@/components/ui/toast"
import { getErrorMessage, isNotFoundError } from "@/lib/api/error-messages"
import { jobApplicationService } from "@/services/job-application-service"
import { ApplicationEvent, JobApplication } from "@/types/job-application.types"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useApplicationActions } from "./use-application-actions"

export type JobApplicationLoadState =
  "loading" | "ready" | "not-found" | "error"

export function useJobApplication(id: string) {
  const { getToken } = useAuth()
  const router = useRouter()
  const [application, setApplication] = useState<JobApplication | null>(null)
  const [events, setEvents] = useState<ApplicationEvent[]>([])
  const [loadState, setLoadState] = useState<JobApplicationLoadState>("loading")
  const [isDeleting, setIsDeleting] = useState(false)

  // `silent` keeps the page visible while data refreshes in the background.
  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoadState("loading")
      try {
        const token = await getToken()
        const options = { token: token ?? undefined }
        const [app, eventList] = await Promise.all([
          jobApplicationService.getById(id, options),
          jobApplicationService.getEvents(id, options),
        ])
        setApplication(app)
        setEvents(eventList)
        setLoadState("ready")
      } catch (error) {
        console.error(error)
        if (isNotFoundError(error)) {
          setLoadState("not-found")
        } else if (!silent) {
          setLoadState("error")
        }
      }
    },
    [getToken, id]
  )

  const refresh = useCallback(() => load(true), [load])

  // Any action changes the timeline too, so reload the events alongside it.
  const handleApplicationChange = useCallback(
    (updated: JobApplication) => {
      setApplication(updated)
      void load(true)
    },
    [load]
  )

  const actions = useApplicationActions({
    onApplicationChange: handleApplicationChange,
    onStale: refresh,
  })

  const updateEventDate = useCallback(
    async (eventId: string, occurredAt: Date): Promise<boolean> => {
      try {
        const token = await getToken()
        const result = await jobApplicationService.updateEventDate(
          id,
          eventId,
          { occurredAt },
          { token: token ?? undefined }
        )
        handleApplicationChange(result.application)
        toast.add({ title: "¡Listo, fecha actualizada!", type: "success" })
        return true
      } catch (error) {
        console.error(error)
        toast.add({
          title: "Uy",
          description: getErrorMessage(
            error,
            "No pudimos cambiar la fecha. ¿Le damos otra vez?"
          ),
          type: "error",
        })
        return false
      }
    },
    [getToken, id, handleApplicationChange]
  )

  const deleteApplication = useCallback(async () => {
    setIsDeleting(true)
    try {
      const token = await getToken()
      await jobApplicationService.delete(id, { token: token ?? undefined })
      router.push("/job-applications")
    } catch (error) {
      console.error(error)
      toast.add({
        title: "Uy",
        description: "No pudimos eliminar la postulación. ¿Le damos otra vez?",
        type: "error",
      })
      setIsDeleting(false)
    }
  }, [getToken, id, router])

  useEffect(() => {
    void Promise.resolve().then(() => load())
  }, [load])

  return {
    application,
    events,
    loadState,
    reload: load,
    refresh,
    updateEventDate,
    deleteApplication,
    isDeleting,
    changeStage: actions.changeStage,
    changeStatus: actions.changeStatus,
    revive: actions.revive,
    undoEvent: actions.undoEvent,
  }
}
