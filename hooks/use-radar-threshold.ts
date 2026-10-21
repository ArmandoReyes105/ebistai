"use client"

import { appConfigurationService } from "@/services/app-configuration-service"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"

const DEFAULT_THRESHOLD_DAYS = 14

// Radar ghosting threshold, fetched once. Purely decorative consumers use it,
// so it falls back to the default while loading or on error and never toasts.
export function useRadarThreshold(): number {
  const { getToken } = useAuth()
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD_DAYS)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const token = await getToken()
        const config = await appConfigurationService.getConfig({
          token: token ?? undefined,
        })
        if (!cancelled && config.radarGhostingThresholdDays > 0) {
          setThreshold(config.radarGhostingThresholdDays)
        }
      } catch {
        // Keep the default.
      }
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [getToken])

  return threshold
}
