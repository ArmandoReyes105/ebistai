"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useJobApplication } from "@/hooks/use-job-application"
import Link from "next/link"
import { useState } from "react"
import ApplicationActionsCard from "./application-actions-card"
import ApplicationDetailHeader from "./application-detail-header"
import ApplicationInfoCard from "./application-info-card"
import ApplicationProgressCard from "./application-progress-card"
import ApplicationTaiTile from "./application-tai-tile"
import ApplicationTimeline from "./application-timeline"
import DeleteApplicationDialog from "./delete-application-dialog"
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <Skeleton className="h-72 lg:col-span-3" />
      <Skeleton className="h-72" />
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
      <Skeleton className="h-64 lg:col-span-2 lg:col-start-1 lg:row-start-1" />
      <Skeleton className="h-64 lg:col-start-3 lg:row-start-1" />
    </div>
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
    deleteApplication,
    isDeleting,
    changeStage,
    changeStatus,
    revive,
    undoEvent,
  } = useJobApplication(id)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (loadState === "loading") return <DetailSkeleton />

  if (loadState === "not-found") {
    return (
      <MessageState
        title="No encontramos esta postulación"
        description="Puede que la hayas eliminado o que el enlace no esté bien."
      />
    )
  }

  if (loadState === "error" || !application) {
    return (
      <MessageState
        title="Uy, algo salió mal"
        description="Se nos atoró algo al traer esta postulación. ¿Lo intentamos de nuevo?"
        action={{ label: "Reintentar", onClick: () => void reload() }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ApplicationDetailHeader
        application={application}
        isDeleting={isDeleting}
        onEdit={() => setIsEditOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
      />

      {/* Row 1: progress (3/4) and the Tai tile (1/4). Row 2: history on the
          left (2/3), actions over details on the right (1/3). Below lg it
          stacks in DOM order: progress, Tai, actions, details, history. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <ApplicationProgressCard
            application={application}
            events={events}
            onStageChange={(stage) => changeStage(application.id, stage)}
          />
        </div>
        <div className="flex flex-col lg:col-span-1">
          <ApplicationTaiTile application={application} events={events} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-4 lg:col-start-3 lg:row-start-1">
          <ApplicationActionsCard
            application={application}
            events={events}
            onStageChange={(stage) => changeStage(application.id, stage)}
            onStatusChange={(status) => changeStatus(application.id, status)}
            onRevive={() => revive(application.id)}
          />
          <ApplicationInfoCard
            application={application}
            onEdit={() => setIsEditOpen(true)}
          />
        </div>

        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <ApplicationTimeline
            events={events}
            status={application.status}
            stage={application.stage}
            onUpdateDate={updateEventDate}
            onUndo={(eventId) => undoEvent(application.id, eventId)}
          />
        </div>
      </div>

      <UpdateApplicationDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        application={application}
        onCreated={refresh}
      />

      <DeleteApplicationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        application={application}
        onConfirm={() => void deleteApplication()}
      />
    </div>
  )
}

export default JobApplicationDetail
