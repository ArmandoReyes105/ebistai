"use client"

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
import { stageOptions, statusOptions } from "@/types/enums-options"
import { JobApplication } from "@/types/job-application.types"
import {
  EllipsisVertical,
  SquareArrowOutUpRight,
  SquarePen,
  Trash,
} from "lucide-react"
import { useState } from "react"
import DeleteApplicationDialog from "./delete-application-dialog"
import UpdateApplicationDialog from "./update-application-dialog"
import { Stage, Status } from "@/types/enums"

interface JobApplicationRowProps {
  jobApplication: JobApplication
  handleStatusChange: (id: string, status: Status) => Promise<void>
  handleStageChange: (id: string, stage: Stage) => Promise<void>
  onDelete: (id: string) => Promise<void>
  fetchJobApplications: () => Promise<void>
}

const JobApplicationRow = ({
  jobApplication,
  handleStatusChange,
  handleStageChange,
  onDelete,
  fetchJobApplications,
}: JobApplicationRowProps) => {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appToUpdate, setAppToUpdate] = useState<JobApplication | null>(null)

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex flex-col gap-1">
            <span className="font-bold">{jobApplication.jobTitle}</span>
            <span className="font-normal text-muted-foreground">
              {new Date(jobApplication.dateApplied).toLocaleDateString()}
            </span>
          </div>
        </TableCell>
        <TableCell>{jobApplication.company}</TableCell>
        <TableCell>
          <StatusSelect
            value={jobApplication.status}
            items={statusOptions}
            config={statusBadgeConfig}
            onChange={(newStatus) =>
              handleStatusChange(jobApplication.id, newStatus)
            }
          />
        </TableCell>
        <TableCell>
          <StatusSelect
            value={jobApplication.stage}
            items={stageOptions}
            config={stageBadgeConfig}
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
            {jobApplication.jobPostingUrl ? (
              <a
                href={jobApplication.jobPostingUrl}
                target="_blank"
                rel="noopener noreferrer"
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
                  <Button variant="outline">
                    <EllipsisVertical></EllipsisVertical>{" "}
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Mi Postulación</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setIsUpdateDialogOpen(true)
                      setAppToUpdate(jobApplication)
                    }}
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
        application={appToUpdate}
        onCreated={fetchJobApplications}
      />
    </>
  )
}

export default JobApplicationRow
