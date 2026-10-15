"use client"

import { toast } from "@/components/ui/toast"
import { appConfigurationService } from "@/services/app-configuration-service"
import {
  AppConfiguration,
  PendingAutoIgnoreConfirmation,
  UpdateAppConfigurationRequest,
} from "@/types/app-configuration.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useRef, useState } from "react"

function showSavedToast(ignoredCount?: number) {
  if (ignoredCount && ignoredCount > 0) {
    toast.add({
      title: `Listo, marqué ${ignoredCount} ${
        ignoredCount === 1 ? "postulación" : "postulaciones"
      } como ${ignoredCount === 1 ? "ignorada" : "ignoradas"}`,
      description: "Tus preferencias ya están al día.",
      type: "success",
    })
    return
  }

  toast.add({
    title: "¡Guardado!",
    description: "Tus preferencias ya están al día.",
    type: "success",
  })
}

export function useAppConfiguration() {
  const { getToken } = useAuth()
  const [config, setConfig] = useState<AppConfiguration | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingAutoIgnoreConfirmation | null>(null)
  const configRef = useRef<AppConfiguration | null>(null)
  // Synchronous guard: state updates are async, so it cannot stop double clicks.
  const isBusyRef = useRef(false)

  useEffect(() => {
    configRef.current = config
  }, [config])

  const fetchConfig = useCallback(async () => {
    const token = await getToken()
    setIsLoading(true)

    try {
      const result = await appConfigurationService.getConfig({
        token: token ?? undefined,
      })
      setConfig(result)
    } catch (error) {
      toast.add({
        title: "Uy",
        description:
          "Se nos atoró algo al cargar tu configuración. ¿Recargas la página?",
        type: "error",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  // Optimistic path: reflect the change immediately, roll back on failure.
  const saveOptimistic = useCallback(
    async (changes: UpdateAppConfigurationRequest) => {
      const previous = configRef.current
      if (!previous) return

      setConfig({ ...previous, ...changes })
      setIsSaving(true)

      try {
        const token = await getToken()
        const result = await appConfigurationService.patchConfig(changes, {
          token: token ?? undefined,
        })
        showSavedToast(result?.ignoredCount)
      } catch (error) {
        setConfig(previous)
        toast.add({
          title: "Uy",
          description: "No pudimos guardar tus cambios. ¿Le damos otra vez?",
          type: "error",
        })
        console.error(error)
      } finally {
        setIsSaving(false)
      }
    },
    [getToken]
  )

  // Confirmation path: the backend may mutate applications, so state is only
  // updated after the PATCH succeeds.
  const saveConfirmed = useCallback(
    async (changes: UpdateAppConfigurationRequest) => {
      setIsSaving(true)

      try {
        const token = await getToken()
        const result = await appConfigurationService.patchConfig(changes, {
          token: token ?? undefined,
        })
        setConfig((current) => (current ? { ...current, ...changes } : current))
        showSavedToast(result?.ignoredCount)
      } catch (error) {
        toast.add({
          title: "Uy",
          description: "No pudimos guardar tus cambios. ¿Le damos otra vez?",
          type: "error",
        })
        console.error(error)
      } finally {
        setIsSaving(false)
      }
    },
    [getToken]
  )

  const updateConfig = useCallback(
    async (changes: UpdateAppConfigurationRequest) => {
      const previous = configRef.current
      if (!previous || isBusyRef.current) return

      const autoIgnoreAfter =
        changes.enableRadarAutoIgnore ?? previous.enableRadarAutoIgnore
      const thresholdAfter =
        changes.radarGhostingThresholdDays ??
        previous.radarGhostingThresholdDays

      const isEnabling =
        changes.enableRadarAutoIgnore === true &&
        !previous.enableRadarAutoIgnore
      const isLowering =
        previous.enableRadarAutoIgnore &&
        autoIgnoreAfter &&
        thresholdAfter < previous.radarGhostingThresholdDays

      isBusyRef.current = true
      try {
        if (!isEnabling && !isLowering) {
          await saveOptimistic(changes)
          return
        }

        setIsPreviewing(true)
        let affectedCount: number
        try {
          const token = await getToken()
          const preview = await appConfigurationService.getAutoIgnorePreview(
            thresholdAfter,
            { token: token ?? undefined }
          )
          affectedCount = preview.affectedCount
        } catch (error) {
          toast.add({
            title: "Uy",
            description:
              "No pudimos revisar tus postulaciones. ¿Le damos otra vez?",
            type: "error",
          })
          console.error(error)
          return
        } finally {
          setIsPreviewing(false)
        }

        if (affectedCount > 0) {
          setPendingConfirmation({
            changes,
            affectedCount,
            thresholdDays: thresholdAfter,
          })
          return
        }

        await saveConfirmed(changes)
      } finally {
        isBusyRef.current = false
      }
    },
    [getToken, saveOptimistic, saveConfirmed]
  )

  const confirmPending = useCallback(async () => {
    if (!pendingConfirmation || isBusyRef.current) return

    const { changes } = pendingConfirmation
    setPendingConfirmation(null)
    isBusyRef.current = true
    try {
      await saveConfirmed(changes)
    } finally {
      isBusyRef.current = false
    }
  }, [pendingConfirmation, saveConfirmed])

  const cancelPending = useCallback(() => setPendingConfirmation(null), [])

  useEffect(() => {
    void Promise.resolve().then(fetchConfig)
  }, [fetchConfig])

  return {
    config,
    isLoading,
    isSaving,
    isPreviewing,
    pendingConfirmation,
    fetchConfig,
    updateConfig,
    confirmPending,
    cancelPending,
  }
}
