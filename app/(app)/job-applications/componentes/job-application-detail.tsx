"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useJobApplication } from "@/hooks/use-job-application"
import Link from "next/link"
import { useState } from "react"
import ApplicationActionsCard from "./application-actions-card"
import ApplicationDetailHeader from "./application-detail-header"
import ApplicationInfoCard from "./application-info-card"
import ApplicationTimeline from "./application-timeline"
import UpdateApplicationDialog from "./update-application-dialog"

interface JobApplicationDetailProps {
  id: string
}

const DetailSkeleton = () => (
  <div
    className="flex flex-col gap-4"
    role="status"
    aria-label="Cargando la postulación"
  >
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-8 w-80 max-w-full" />
    <Skeleton className="h-4 w-60 max-w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-56 w-full" />
  </div>
)

interface MessageStateProps {
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

const MessageState = ({ title, description, action }: MessageStateProps) => (
  <div className="flex flex-col items-start gap-3 py-8">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-sm text-muted-foreground">{description}</p>
    <div className="flex flex-wrap gap-2">
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      <Button variant="outline" render={<Link href="/job-applications" />}>
        Volver a mis solicitudes
      </Button>
    </div>
  </div>
)

const JobApplicationDetail = ({ id }: JobApplicationDetailProps) => {
  const {
    application,
    events,
    loadState,
    reload,
    refresh,
    updateEventDate,
    changeStage,
    changeStatus,
    revive,
    undoEvent,
  } = useJobApplication(id)
  const [isEditOpen, setIsEditOpen] = useState(false)

  if (loadState === "loading") return <DetailSkeleton />

  if (loadState === "not-found") {
    return (
      <MessageState
        title="No encontramos esta postulación"
        description="Puede que la hayas eliminado o que el enlace no sea correcto."
      />
    )
  }

  if (loadState === "error" || !application) {
    return (
      <MessageState
        title="Algo salió mal"
        description="No pudimos cargar esta postulación. Inténtalo de nuevo en un momento."
        action={{ label: "Reintentar", onClick: () => void reload() }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ApplicationDetailHeader application={application} />

      <ApplicationInfoCard application={application} />

      <ApplicationActionsCard
        application={application}
        onStageChange={(stage) => changeStage(application.id, stage)}
        onStatusChange={(status) => changeStatus(application.id, status)}
        onRevive={() => revive(application.id)}
        onEdit={() => setIsEditOpen(true)}
      />

      <ApplicationTimeline
        events={events}
        onUpdateDate={updateEventDate}
        onUndo={(eventId) => undoEvent(application.id, eventId)}
      />

      <UpdateApplicationDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        application={application}
        onCreated={refresh}
      />
    </div>
  )
}

export default JobApplicationDetail
