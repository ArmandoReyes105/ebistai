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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Skeleton className="h-40 lg:col-span-2" />
      <Skeleton className="h-32 lg:col-span-2 lg:row-start-2" />
      <Skeleton className="h-56 lg:col-start-3 lg:row-span-2 lg:row-start-1" />
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
      <ApplicationDetailHeader application={application} />

      {/* Bento layout: details and actions on the left, the history as a
          tall column on the right. Below lg it stacks in DOM order:
          details, actions, history. */}
      <div className="grid grid-cols-1 gap-4 *:*:h-full lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
        <div className="lg:col-span-2">
          <ApplicationInfoCard
            application={application}
            onEdit={() => setIsEditOpen(true)}
          />
        </div>

        <div className="lg:col-span-2 lg:row-start-2">
          <ApplicationActionsCard
            application={application}
            onStageChange={(stage) => changeStage(application.id, stage)}
            onStatusChange={(status) => changeStatus(application.id, status)}
            onRevive={() => revive(application.id)}
          />
        </div>

        <div className="lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <ApplicationTimeline
            events={events}
            status={application.status}
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
    </div>
  )
}

export default JobApplicationDetail
