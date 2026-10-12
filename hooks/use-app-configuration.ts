"use client"

import { toast } from "@/components/ui/toast"
import { appConfigurationService } from "@/services/app-configuration-service"
import {
  AppConfiguration,
  UpdateAppConfigurationRequest,
} from "@/types/app-configuration.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useRef, useState } from "react"

export function useAppConfiguration() {
  const { getToken } = useAuth()
  const [config, setConfig] = useState<AppConfiguration | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const configRef = useRef<AppConfiguration | null>(null)

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
        title: "Error",
        description: "No pudimos cargar tu configuración.",
        type: "error",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  const updateConfig = useCallback(
    async (changes: UpdateAppConfigurationRequest) => {
      const previous = configRef.current
      if (!previous) return

      // Optimistic update: reflect the change immediately, roll back on failure.
      setConfig({ ...previous, ...changes })
      setIsSaving(true)

      try {
        const token = await getToken()
        await appConfigurationService.patchConfig(changes, {
          token: token ?? undefined,
        })
        toast.add({
          title: "Configuración guardada",
          description: "Tus preferencias se actualizaron.",
          type: "success",
        })
      } catch (error) {
        setConfig(previous)
        toast.add({
          title: "Error",
          description: "No pudimos guardar tu configuración.",
          type: "error",
        })
        console.error(error)
      } finally {
        setIsSaving(false)
      }
    },
    [getToken]
  )

  useEffect(() => {
    void Promise.resolve().then(fetchConfig)
  }, [fetchConfig])

  return { config, isLoading, isSaving, fetchConfig, updateConfig }
}
