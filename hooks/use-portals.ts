"use client"

import { portalService } from "@/services/portal-service"
import { Portal, SavePortalRequest } from "@/types/portal.types"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useState } from "react"

const byName = (a: Portal, b: Portal) => a.name.localeCompare(b.name, "es")

// The portals of the user. Write errors reach the caller, which shows them.
export function usePortals() {
  const { getToken } = useAuth()
  const [portals, setPortals] = useState<Portal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        const token = await getToken()
        const result = await portalService.getAll({
          token: token ?? undefined,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setPortals(result ?? [])
        setHasError(false)
      } catch (error) {
        if (controller.signal.aborted) return
        console.error(error)
        setHasError(true)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }
    void load()

    return () => controller.abort()
  }, [getToken, reloadKey])

  const reload = useCallback(() => {
    setIsLoading(true)
    setReloadKey((key) => key + 1)
  }, [])

  const createPortal = useCallback(
    async (data: SavePortalRequest) => {
      const token = await getToken()
      const created = await portalService.create(data, {
        token: token ?? undefined,
      })
      setPortals((current) => [...current, created].sort(byName))
      return created
    },
    [getToken]
  )

  const updatePortal = useCallback(
    async (id: string, data: SavePortalRequest) => {
      const token = await getToken()
      const updated = await portalService.update(id, data, {
        token: token ?? undefined,
      })
      setPortals((current) =>
        current.map((p) => (p.id === id ? updated : p)).sort(byName)
      )
      return updated
    },
    [getToken]
  )

  const deletePortal = useCallback(
    async (id: string) => {
      const token = await getToken()
      await portalService.delete(id, { token: token ?? undefined })
      setPortals((current) => current.filter((p) => p.id !== id))
    },
    [getToken]
  )

  return {
    portals,
    isLoading,
    hasError,
    reload,
    createPortal,
    updatePortal,
    deletePortal,
  }
}
