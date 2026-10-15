"use client"

import StatusSelect from "@/components/status-select"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import {
  stageBadgeConfig,
  statusBadgeConfig,
} from "@/lib/components/badge-config"
import {
  canRevive,
  getStageTargets,
  getStatusTargets,
  isTerminal,
} from "@/lib/domain/application-rules"
import { Stage, Status } from "@/types/enums"
import { stageOptions, statusOptions } from "@/types/enums-options"
import { JobApplication } from "@/types/job-application.types"
import { RotateCcw } from "lucide-react"
import { useState } from "react"

interface ApplicationActionsCardProps {
  application: JobApplication
  onStageChange: (stage: Stage) => Promise<unknown>
  onStatusChange: (status: Status) => Promise<unknown>
  onRevive: () => Promise<unknown>
}

const ApplicationActionsCard = ({
  application,
  onStageChange,
  onStatusChange,
  onRevive,
}: ApplicationActionsCardProps) => {
  const [isReviving, setIsReviving] = useState(false)

  const stageTargets = getStageTargets(application)
  const statusTargets = getStatusTargets(application)
  const terminal = isTerminal(application)

  const revive = async () => {
    setIsReviving(true)
    try {
      await onRevive()
    } finally {
      setIsReviving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones</CardTitle>
        <CardDescription>
          {terminal
            ? "Esta postulación ya no está activa, así que no se puede mover de etapa."
            : "Los cambios se aplican con la fecha de hoy y puedes deshacerlos."}
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Etapa</FieldLabel>
              <StatusSelect
                aria-label="Cambiar etapa"
                value={application.stage}
                items={stageOptions.filter((o) =>
                  stageTargets.includes(o.value)
                )}
                config={stageBadgeConfig}
                disabled={terminal}
                onChange={onStageChange}
              />
            </Field>
            <Field>
              <FieldLabel>Estado</FieldLabel>
              <StatusSelect
                aria-label="Cambiar estado"
                value={application.status}
                items={statusOptions.filter((o) =>
                  statusTargets.includes(o.value)
                )}
                config={statusBadgeConfig}
                disabled={terminal}
                onChange={onStatusChange}
              />
            </Field>
          </div>
          {canRevive(application) && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={isReviving} onClick={revive}>
                <RotateCcw data-icon="inline-start" />
                Revivir
              </Button>
            </div>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

export default ApplicationActionsCard
