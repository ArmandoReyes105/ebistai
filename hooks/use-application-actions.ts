"use client"

import { toast } from "@/components/ui/toast"
import {
  describeStageChange,
  describeStatusChange,
} from "@/lib/domain/application-rules"
import {
  getErrorMessage,
  isConflictError,
  isNotFoundError,
} from "@/lib/api/error-messages"
import { jobApplicationService } from "@/services/job-application-service"
import { Stage, Status } from "@/types/enums"
import {
  ApplicationActionResponse,
  JobApplication,
} from "@/types/job-application.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback } from "react"

const UNDO_TOAST_TIMEOUT_MS = 8000

interface UseApplicationActionsOptions {
  // Called with the fresh application after any successful action or undo.
  onApplicationChange: (application: JobApplication) => void
  // Called when local data is stale (conflict or not found) and must be reloaded.
  onStale: () => void
}

// Shared stage / status / revive / undo actions. Every action applies with
// "now" as the date, updates from the server response and offers an undo toast.
export function useApplicationActions({
  onApplicationChange,
  onStale,
}: UseApplicationActionsOptions) {
  const { getToken } = useAuth()

  const reportError = useCallback(
    (error: unknown, fallback: string) => {
      console.error(error)
      const isConflict = isConflictError(error)
      if (isConflict || isNotFoundError(error)) onStale()

      toast.add({
        title: isConflict ? "Algo cambió mientras tanto" : "Ups",
        description: isConflict
          ? "Actualicé la información para que veas lo último."
          : getErrorMessage(error, fallback),
        type: isConflict ? "warning" : "error",
      })
    },
    [onStale]
  )

  const undoEvent = useCallback(
    async (applicationId: string, eventId: string): Promise<boolean> => {
      try {
        const token = await getToken()
        const result = await jobApplicationService.undoEvent(
          applicationId,
          eventId,
          { token: token ?? undefined }
        )
        onApplicationChange(result.application)
        toast.add({ title: "Cambio deshecho", type: "success" })
        return true
      } catch (error) {
        reportError(error, "No pudimos deshacer el cambio. Inténtalo de nuevo.")
        return false
      }
    },
    [getToken, onApplicationChange, reportError]
  )

  const run = useCallback(
    async (
      request: (token: string | undefined) => Promise<ApplicationActionResponse>,
      message: string,
      fallbackError: string
    ): Promise<boolean> => {
      try {
        const token = await getToken()
        const result = await request(token ?? undefined)
        onApplicationChange(result.application)

        const toastId = toast.add({
          title: message,
          type: "success",
          timeout: UNDO_TOAST_TIMEOUT_MS,
          actionProps: {
            children: "Deshacer",
            onClick: () => {
              toast.close(toastId)
              void undoEvent(result.application.id, result.eventId)
            },
          },
        })
        return true
      } catch (error) {
        reportError(error, fallbackError)
        return false
      }
    },
    [getToken, onApplicationChange, reportError, undoEvent]
  )

  const changeStage = useCallback(
    (id: string, stage: Stage) =>
      run(
        (token) => jobApplicationService.changeStage(id, { stage }, { token }),
        describeStageChange(stage),
        "No pudimos cambiar la etapa. Inténtalo de nuevo."
      ),
    [run]
  )

  const changeStatus = useCallback(
    (id: string, status: Status) =>
      run(
        (token) =>
          jobApplicationService.changeStatus(id, { status }, { token }),
        describeStatusChange(status),
        "No pudimos cambiar el estado. Inténtalo de nuevo."
      ),
    [run]
  )

  const revive = useCallback(
    (id: string) =>
      run(
        (token) => jobApplicationService.revive(id, {}, { token }),
        describeStatusChange(Status.Active),
        "No pudimos revivir la postulación. Inténtalo de nuevo."
      ),
    [run]
  )

  return { changeStage, changeStatus, revive, undoEvent }
}
