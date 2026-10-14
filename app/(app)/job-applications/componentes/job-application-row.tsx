"use client"

import { ApplicationStateBadge } from "@/components/application-state-badge"
import { StatusBadge } from "@/components/status-badge"
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
  getStageTargets,
  getStatusTargets,
  isTerminal,
} from "@/lib/domain/application-rules"
import { stageOptions, statusOptions } from "@/types/enums-options"
import { JobApplication } from "@/types/job-application.types"
import {
  EllipsisVertical,
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

interface JobApplicationRowProps {
  jobApplication: JobApplication
  handleStatusChange: (id: string, status: Status) => Promise<unknown>
  handleStageChange: (id: string, stage: Stage) => Promise<unknown>
  handleRevive: (id: string) => Promise<unknown>
  onDelete: (id: string) => Promise<void>
  fetchJobApplications: () => Promise<void>
}

const JobApplicationRow = ({
  jobApplication,
  handleStatusChange,
  handleStageChange,
  handleRevive,
  onDelete,
  fetchJobApplications,
}: JobApplicationRowProps) => {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isReviving, setIsReviving] = useState(false)

  const stageTargets = getStageTargets(jobApplication)
  const statusTargets = getStatusTargets(jobApplication)

  const revive = async () => {
    setIsReviving(true)
    try {
      await handleRevive(jobApplication.id)
    } finally {
      setIsReviving(false)
    }
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex flex-col gap-1">
            <Link
              href={`/job-applications/${jobApplication.id}`}
              className="font-bold hover:underline"
            >
              {jobApplication.jobTitle}
            </Link>
            <span className="font-normal text-muted-foreground">
              {new Date(jobApplication.dateApplied).toLocaleDateString()}
            </span>
          </div>
        </TableCell>
        <TableCell>{jobApplication.company}</TableCell>
        <TableCell>
          {isTerminal(jobApplication) ? (
            <div className="flex flex-wrap items-center gap-2">
              <ApplicationStateBadge application={jobApplication} />
              {canRevive(jobApplication) && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isReviving}
                  onClick={revive}
                >
                  <RotateCcw data-icon="inline-start" />
                  Revivir
                </Button>
              )}
            </div>
          ) : (
            <StatusSelect
              aria-label="Cambiar estado"
              value={jobApplication.status}
              items={statusOptions.filter((o) =>
                statusTargets.includes(o.value)
              )}
              config={statusBadgeConfig}
              onChange={(newStatus) =>
                handleStatusChange(jobApplication.id, newStatus)
              }
            />
          )}
        </TableCell>
        <TableCell>
          <StatusSelect
            aria-label="Cambiar etapa"
            value={jobApplication.stage}
            items={stageOptions.filter((o) => stageTargets.includes(o.value))}
            config={stageBadgeConfig}
            disabled={isTerminal(jobApplication)}
            onChange={(newStage) =>
              handleStageChange(jobApplication.id, newStage)
            }
          />
        </TableCell>
        <TableCell>
          <StatusBadge
            value={jobApplication.mode}
            config={modalityBadgeConfig}
          />
        </TableCell>
        <TableCell>{jobApplication.applicationSource}</TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-4">
            {safeHttpUrl(jobApplication.jobPostingUrl) ? (
              <a
                href={safeHttpUrl(jobApplication.jobPostingUrl)!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver oferta de ${jobApplication.jobTitle}`}
                className="text-blue-600 underline hover:text-blue-800"
              >
                <SquareArrowOutUpRight className="ml-1 inline h-4 w-4" />
              </a>
            ) : (
              <></>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" aria-label="Más opciones">
                    <EllipsisVertical></EllipsisVertical>{" "}
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Mi Postulación</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsUpdateDialogOpen(true)}
                  >
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
          </div>
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
        onCreated={fetchJobApplications}
      />
    </>
  )
}

export default JobApplicationRow
