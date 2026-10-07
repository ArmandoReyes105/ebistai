"use client"

import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import AntiGhostingRadar from "./anti-ghosting-radar"
import ApplicationStageOverview from "./application-stage-overview"
import RecentApplicationsList from "./recent-applications-list"
import StatsCards from "./stats-cards"

const Dashboard = () => {
  const { data, isLoading, markAsIgnored } = useDashboardStats()

  if (isLoading || !data) {
    return (
      <p className="text-sm text-muted-foreground">Preparando tu resumen ...</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="block text-sm text-muted-foreground">
        Tienes {data.totalApplications} procesos abiertos;{" "}
        {data.byStage["Interview"]} están en etapa de entrevista
      </span>

      <StatsCards
        totalApplications={data.totalApplications}
        byStage={data.byStage}
      />

      <AntiGhostingRadar
        radarApplications={data.antiGhostingRadar}
        onMarkAsIgnored={markAsIgnored}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentApplicationsList applications={data.recentApplications} />

        <ApplicationStageOverview
          totalApplications={data.totalApplications}
          byStage={data.byStage}
        />
      </div>
    </div>
  )
}

export default Dashboard
