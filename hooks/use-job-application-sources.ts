"use client"

import { jobApplicationService } from "@/services/job-application-service"
import { JobApplicationSource } from "@/types/job-application.types"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"

// Sources the user has already used; feeds the source filter.
// Bump `refreshKey` to reload (after creating or editing an application).
export function useJobApplicationSources(refreshKey?: unknown) {
  const { getToken } = useAuth()
  const [sources, setSources] = useState<JobApplicationSource[]>([])

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        const token = await getToken()
        const result = await jobApplicationService.getSources({
          token: token ?? undefined,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) setSources(result ?? [])
      } catch (error) {
        if (!controller.signal.aborted) console.error(error)
      }
    }
    void load()

    return () => controller.abort()
  }, [getToken, refreshKey])

  return sources
}
