"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@clerk/nextjs"
import { JobApplication } from "@/types/job-application.types"
import { jobApplicationService } from "@/services/job-application-service"
import { StatusBadge } from "@/components/status-badge"
import {
  modalityBadgeConfig,
  stageBadgeConfig,
  statusBadgeConfig,
} from "@/lib/components/badge-config"
import {
  EllipsisVertical,
  SquareArrowOutUpRight,
  SquarePen,
  Trash,
} from "lucide-react"
import { toast } from "@/components/ui/toast"
import JobApplicationDialog from "./job-application-dialog"
import { Stage, Status } from "@/types/enums"
import StatusSelect from "@/components/status-select"
import { stageOptions, statusOptions } from "@/types/enums-options"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import DeleteApplicationDialog from "./delete-application-dialog"
import UpdateApplicationDialog from "./update-application-dialog"

const JobApplicationList = () => {
  const { getToken } = useAuth()
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([])
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appToDelete, setAppToDelete] = useState<JobApplication | null>(null)
  const [appToUpdate, setAppToUpdate] = useState<JobApplication | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchJobApplications = useCallback(async () => {
    setIsLoading(true)
    const token = await getToken()

    try {
      const response = await jobApplicationService.getAll({
        token: token ?? undefined,
      })
      setJobApplications(response)
    } catch (error) {
      toast.add({
        title: "Error",
        description:
          "No se pudieron cargar las solicitudes de empleo. Por favor, inténtelo de nuevo más tarde.",
        type: "error",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  async function handleStatusChange(id: string, newStatus: Status) {
    const token = await getToken()
    const previous = jobApplications

    // Optimistic update: refleja el cambio de inmediato en la UI
    setJobApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    )

    try {
      await jobApplicationService.updateStatus(
        id,
        { status: newStatus },
        { token: token ?? undefined }
      )
    } catch (error) {
      // Si falla, revierte al estado anterior
      setJobApplications(previous)
      toast.add({
        title: "Error",
        description: "No se pudo actualizar el estado. Inténtalo de nuevo.",
        type: "error",
      })
      console.error(error)
    }
  }

  async function handleStageChange(id: string, newStage: Stage) {
    const token = await getToken()
    const previous = jobApplications

    setJobApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, stage: newStage } : app))
    )

    try {
      await jobApplicationService.updateStage(
        id,
        { stage: newStage },
        { token: token ?? undefined }
      )
    } catch (error) {
      setJobApplications(previous)
      toast.add({
        title: "Error",
        description: "No se pudo actualizar la etapa. Inténtalo de nuevo.",
        type: "error",
      })
      console.error(error)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!appToDelete) return

    const token = await getToken()
    const previous = jobApplications

    setJobApplications((prev) => prev.filter((a) => a.id !== appToDelete.id))
    setDeleteDialogOpen(false)

    try {
      await jobApplicationService.delete(appToDelete.id, {
        token: token ?? undefined,
      })
    } catch (error) {
      setJobApplications(previous)
      toast.add({
        title: "Error",
        description: "No se pudo eliminar la solicitud. Inténtalo de nuevo.",
        type: "error",
      })
      console.error(error)
    } finally {
      setAppToDelete(null)
    }
  }

  useEffect(() => {
    const loadApplications = () => {
      void fetchJobApplications()
    }

    queueMicrotask(loadApplications)
  }, [fetchJobApplications])

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="mb-4 text-2xl font-bold">Mis solicitudes de trabajo</h1>
        <JobApplicationDialog onCreated={fetchJobApplications} />
      </div>

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
          <TableCaption>Lista de puestos solicitados</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Puesto y Fecha</TableHead>
              <TableHead>Compañia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead>Fuente de Aplicación</TableHead>
              <TableHead className="text-end">Opciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobApplications.map((jobApplication, key) => (
              <TableRow key={key}>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">{jobApplication.jobTitle}</span>
                    <span className="font-normal text-muted-foreground">
                      {new Date(
                        jobApplication.dateApplied
                      ).toLocaleDateString()}
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
                      <p></p>
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
                              setAppToDelete(jobApplication)
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
            ))}
          </TableBody>
        </Table>
      )}

      <DeleteApplicationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        application={appToDelete}
      />

      <UpdateApplicationDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        application={appToUpdate}
        onCreated={fetchJobApplications}
      />
    </div>
  )
}

export default JobApplicationList
