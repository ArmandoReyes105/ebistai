"use client"

import { toast } from "@/components/ui/toast"
import { statsService } from "@/services/stats-service"
import { DashboardStats } from "@/types/stats.types"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import ApplicationStageOverview from "./application-stage-overview"
import RecentApplicationsList from "./recent-applications-list"
import StatsCards from "./stats-cards"

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
        <p className="text-sm text-muted-foreground">
          Preparando tu resumen ...
        </p>
      ) : data ? (
        <>
          <span className="mb-4 block text-sm text-muted-foreground">
            Tienes {data.totalApplications} procesos abiertos;{" "}
            {data.byStage["Interview"]} estan en etapa de entrevista
          </span>

          <StatsCards
            totalApplications={data.totalApplications}
            byStage={data.byStage}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecentApplicationsList applications={data.recentApplications} />

            <ApplicationStageOverview
              totalApplications={data.totalApplications}
              byStage={data.byStage}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Preparando tu resumen ...
        </p>
      )}
    </>
  )
}

export default Dashboard
