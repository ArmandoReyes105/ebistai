"use client"

import StatusSelect from "@/components/status-select"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { getNextStage, getReachedStages } from "@/lib/domain/stage-flow"
import { Stage, Status } from "@/types/enums"
import { stageOptions, statusOptions } from "@/types/enums-options"
import { ApplicationEvent, JobApplication } from "@/types/job-application.types"
import { ArrowRight, RotateCcw } from "lucide-react"
import { useState } from "react"

interface ApplicationActionsCardProps {
  application: JobApplication
  // History of the application; tells which stages were already reached.
  events: ApplicationEvent[]
  onStageChange: (stage: Stage) => Promise<unknown>
  onStatusChange: (status: Status) => Promise<unknown>
  onRevive: () => Promise<unknown>
}

// The card is drawn inverted (ink in light mode, near-white in dark mode),
// so every inner colour is relative to `background` to flip with the theme.
const fieldLabelClass =
  "font-mono text-xs tracking-wider text-background/60 uppercase"
const selectTriggerClass =
  "h-11 w-full border-background/20 bg-background/10 px-3.5 text-[15px] text-background hover:bg-background/15 [&_svg]:text-background/60"
const primaryButtonClass =
  "h-11 w-full gap-2 bg-background text-sm font-semibold text-foreground hover:bg-background/90"

const ApplicationActionsCard = ({
  application,
  events,
  onStageChange,
  onStatusChange,
  onRevive,
}: ApplicationActionsCardProps) => {
  const [isReviving, setIsReviving] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)

  const stageTargets = getStageTargets(application)
  const statusTargets = getStatusTargets(application)
  const terminal = isTerminal(application)
  // Shortcut to the next stage of the flow, only when the rules allow it.
  const candidate =
    application.status === Status.Active
      ? getNextStage(application.stage, getReachedStages(events))
      : undefined
  const nextStage =
    candidate !== undefined && stageTargets.includes(candidate)
      ? candidate
      : undefined

  const revive = async () => {
    setIsReviving(true)
    try {
      await onRevive()
    } finally {
      setIsReviving(false)
    }
  }

  const advance = async (stage: Stage) => {
    setIsAdvancing(true)
    try {
      await onStageChange(stage)
    } finally {
      setIsAdvancing(false)
    }
  }

  return (
    <Card className="gap-4 bg-foreground p-6 text-background ring-0">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Acciones</h2>
        {terminal && (
          <p className="text-sm text-background/60">
            Esta postulación ya no está activa, así que no se puede mover de
            etapa.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className={fieldLabelClass}>Etapa</span>
        <StatusSelect
          aria-label="Cambiar etapa"
          value={application.stage}
          items={stageOptions.filter((o) => stageTargets.includes(o.value))}
          config={stageBadgeConfig}
          disabled={terminal || isAdvancing}
          triggerClassName={selectTriggerClass}
          plainValue
          onChange={onStageChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className={fieldLabelClass}>Estado</span>
        <StatusSelect
          aria-label="Cambiar estado"
          value={application.status}
          items={statusOptions.filter((o) => statusTargets.includes(o.value))}
          config={statusBadgeConfig}
          disabled={terminal || isAdvancing}
          triggerClassName={selectTriggerClass}
          plainValue
          onChange={onStatusChange}
        />
      </div>

      {nextStage !== undefined && (
        <Button
          className={primaryButtonClass}
          disabled={isAdvancing}
          onClick={() => advance(nextStage)}
        >
          Avanzar a {stageBadgeConfig[nextStage].label}
          <ArrowRight data-icon="inline-end" />
        </Button>
      )}

      {canRevive(application) && (
        <Button
          className={primaryButtonClass}
          disabled={isReviving}
          onClick={revive}
        >
          <RotateCcw data-icon="inline-start" />
          Revivir
        </Button>
      )}
    </Card>
  )
}

export default ApplicationActionsCard
