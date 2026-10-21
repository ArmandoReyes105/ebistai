"use client"

import StatusSelect from "@/components/status-select"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  modalityBadgeConfig,
  stageBadgeConfig,
  statusBadgeConfig,
} from "@/lib/components/badge-config"
import {
  canRevive,
  getCombinedLabel,
  getStageTargets,
  getStatusTargets,
  isTerminal,
} from "@/lib/domain/application-rules"
import { daysBetween, pluralDays } from "@/lib/domain/dates"
import { STAGE_FLOW } from "@/lib/domain/stage-flow"
import { stageOptions, statusOptions } from "@/types/enums-options"
import { JobApplication } from "@/types/job-application.types"
import { cn } from "cn"
import {
  Ellipsis,
  RotateCcw,
  SquareArrowOutUpRight,
  SquarePen,
  Trash,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import DeleteApplicationDialog from "./delete-application-dialog"
import UpdateApplicationDialog from "./update-application-dialog"
import { safeHttpUrl } from "@/lib/safe-url"
import { Stage, Status } from "@/types/enums"

const chipClassName =
  "rounded-none border px-2 py-1.5 font-mono text-[11px] tracking-wider uppercase"

// "04 oct": 2-digit day, short month, no trailing dot.
const formatShortDate = (date: Date) =>
  date
    .toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
    .replace(".", "")

const formatIdleDays = (days: number) =>
  days <= 0 ? "Hoy" : days === 1 ? "Ayer" : pluralDays(days)

interface JobApplicationRowProps {
  jobApplication: JobApplication
  // Days without progress from which an active application reads as stale.
  staleThreshold: number
  handleStatusChange: (id: string, status: Status) => Promise<unknown>
  handleStageChange: (id: string, stage: Stage) => Promise<unknown>
  handleRevive: (id: string) => Promise<unknown>
  onDelete: (id: string) => Promise<void>
  onUpdated: (updated?: JobApplication) => void
}

const JobApplicationRow = ({
  jobApplication,
  staleThreshold,
  handleStatusChange,
  handleStageChange,
  handleRevive,
  onDelete,
  onUpdated,
}: JobApplicationRowProps) => {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const stageTargets = getStageTargets(jobApplication)
  const statusTargets = getStatusTargets(jobApplication)

  const closed = isTerminal(jobApplication)
  const postingUrl = safeHttpUrl(jobApplication.jobPostingUrl)
  const appliedAt = new Date(jobApplication.dateApplied)
  const progressAt = jobApplication.lastProgressAt
    ? new Date(jobApplication.lastProgressAt)
    : appliedAt

  // The list has no event history, so progress follows the default flow order.
  const filledSegments = STAGE_FLOW.indexOf(jobApplication.stage) + 1
  const isOffer = jobApplication.stage === Stage.Offer

  const idleDays = daysBetween(progressAt, new Date())
  const isStale = !closed && idleDays >= staleThreshold

  return (
    <>
      <TableRow className={cn("border-b border-muted", closed && "opacity-55")}>
        <TableCell className="px-5 py-4 font-medium">
          <div className="flex flex-col gap-1">
            <Link
              href={`/job-applications/${jobApplication.id}`}
              className="font-semibold hover:underline"
            >
              {jobApplication.jobTitle}
            </Link>
            <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Aplicada {formatShortDate(appliedAt)}
            </span>
          </div>
        </TableCell>
        <TableCell className="px-3 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center bg-foreground text-sm font-bold text-background"
            >
              {jobApplication.company.charAt(0).toUpperCase()}
            </span>
            <span>{jobApplication.company}</span>
          </div>
        </TableCell>
        <TableCell className="px-3 py-4">
          <div className="flex flex-col gap-1">
            <div aria-hidden className="flex gap-[3px]">
              {STAGE_FLOW.map((stage, i) => (
                <span
                  key={stage}
                  className={cn(
                    "h-[6px] w-4",
                    i < filledSegments
                      ? isOffer
                        ? "bg-primary"
                        : "bg-foreground"
                      : "bg-border"
                  )}
                />
              ))}
            </div>
            <StatusSelect
              aria-label="Cambiar etapa"
              value={jobApplication.stage}
              items={stageOptions.filter((o) => stageTargets.includes(o.value))}
              config={stageBadgeConfig}
              plainValue
              triggerClassName="h-7 border-transparent bg-transparent pl-0 text-[14px] hover:border-input focus-visible:border-ring dark:bg-transparent dark:hover:bg-transparent"
              disabled={closed}
              onChange={(newStage) =>
                handleStageChange(jobApplication.id, newStage)
              }
            />
          </div>
        </TableCell>
        <TableCell className="px-3 py-4">
          {closed ? (
            // Static chip; the full state ("Rechazada en Entrevista técnica") stays in title and sr-only.
            <span
              title={getCombinedLabel(jobApplication)}
              className={cn(
                chipClassName,
                "inline-block border-border text-muted-foreground"
              )}
            >
              {statusBadgeConfig[jobApplication.status].label}
              <span className="sr-only">
                {" "}
                — {getCombinedLabel(jobApplication)}
              </span>
            </span>
          ) : (
            <StatusSelect
              aria-label="Cambiar estado"
              value={jobApplication.status}
              items={statusOptions.filter((o) =>
                statusTargets.includes(o.value)
              )}
              config={statusBadgeConfig}
              plainValue
              triggerClassName={cn(
                chipClassName,
                "h-auto border-foreground text-foreground dark:bg-transparent dark:hover:bg-transparent"
              )}
              onChange={(newStatus) =>
                handleStatusChange(jobApplication.id, newStatus)
              }
            />
          )}
        </TableCell>
        <TableCell className="px-3 py-4 text-foreground/80">
          {modalityBadgeConfig[jobApplication.mode]?.label}
        </TableCell>
        <TableCell className="px-3 py-4 text-foreground/80">
          {jobApplication.applicationSource}
        </TableCell>
        <TableCell
          className={cn(
            "px-5 py-4 text-right font-mono text-xs",
            isStale
              ? "font-semibold text-primary-text"
              : "text-muted-foreground"
          )}
        >
          {closed ? formatShortDate(progressAt) : formatIdleDays(idleDays)}
        </TableCell>
        <TableCell className="w-14 px-0 py-2 text-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="size-11"
                  aria-label={`Opciones de ${jobApplication.jobTitle}`}
                >
                  <Ellipsis />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Mi Postulación</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {postingUrl && (
                  <DropdownMenuItem
                    render={
                      <a
                        href={postingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <SquareArrowOutUpRight /> Ver vacante
                  </DropdownMenuItem>
                )}
                {/* Kept in the menu, not inline, so reviving is deliberate. */}
                {canRevive(jobApplication) && (
                  <DropdownMenuItem
                    onClick={() => void handleRevive(jobApplication.id)}
                  >
                    <RotateCcw /> Revivir
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setIsUpdateDialogOpen(true)}>
                  <SquarePen /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <DeleteApplicationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={onDelete}
        application={jobApplication}
      />

      <UpdateApplicationDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        application={jobApplication}
        onCreated={onUpdated}
      />
    </>
  )
}

export default JobApplicationRow
