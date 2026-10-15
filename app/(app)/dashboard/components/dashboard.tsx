"use client"

import JobApplicationDialog from "@/app/(app)/job-applications/componentes/job-application-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { ArrowRight, BriefcaseBusinessIcon } from "lucide-react"
import Link from "next/link"
import AntiGhostingRadar from "./anti-ghosting-radar"
import ApplicationStageOverview from "./application-stage-overview"
import RecentApplicationsList from "./recent-applications-list"
import StatsCards from "./stats-cards"

interface DashboardProps {
  firstName: string | null
}

// The header lives here (not in the server page) so creating an application
// from it refreshes the stats below.
const Dashboard = ({ firstName }: DashboardProps) => {
  const { data, isLoading, refreshDashboardStats, markAsIgnored } =
    useDashboardStats()
  const handleCreated = () => void refreshDashboardStats()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row flex-wrap justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {firstName ? `Hola, ${firstName}` : "Hola"}
        </h1>

        <div className="flex flex-row gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/job-applications" />}
          >
            Ver postulaciones <ArrowRight className="h-4 w-4" />
          </Button>
          <JobApplicationDialog onCreated={handleCreated} />
        </div>
      </div>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Preparando tu resumen…</p>
      ) : data.totalApplications === 0 ? (
        // The stat cards always show; the rest of the dashboard would only be
        // zeros, so invite the first step instead.
        <>
          <StatsCards
            totalApplications={data.totalApplications}
            byStage={data.byStage}
          />
          <Empty className="mt-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BriefcaseBusinessIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no tienes postulaciones</EmptyTitle>
              <EmptyDescription>
                Registra tu primera vacante y aquí verás tu resumen: en qué
                etapa va cada proceso y cuáles llevan tiempo sin respuesta.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <JobApplicationDialog onCreated={handleCreated} />
            </EmptyContent>
          </Empty>
        </>
      ) : (
        <>
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
            radarGhostingThresholdDays={data.radarGhostingThresholdDays}
            onMarkAsIgnored={markAsIgnored}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecentApplicationsList applications={data.recentApplications} />

            <ApplicationStageOverview
              totalApplications={data.totalApplications}
              byStage={data.byStage}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
