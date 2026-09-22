"use client"

import { toast } from "@/components/ui/toast"
import { statsService } from "@/services/stats-service"
import { DashboardStats } from "@/types/stats.types"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import ApplicationStageOverview from "./application-stage-overview"

const Dashboard = () => {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const getDashboardData = async () => {
      const token = await getToken()

      try {
        setIsLoading(true)
        const result = await statsService.getDashboardStats({
          token: token ?? undefined,
        })
        setData(result)
      } catch (err) {
        toast.add({
          title: "Error",
          description:
            "Lo sentimos, ocurrio un error al recuperar su información.",
          type: "error",
        })
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = window.setTimeout(() => {
      void getDashboardData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [getToken])

  return (
    <>
      {isLoading ? (
        <p>Cargando ...</p>
      ) : data ? (
        <ApplicationStageOverview
          totalApplications={data.totalApplications}
          byStage={data.byStage}
        />
      ) : (
        <p>Cargando</p>
      )}
    </>
  )
}

export default Dashboard
