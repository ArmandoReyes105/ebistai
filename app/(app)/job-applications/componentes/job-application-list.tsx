"use client"

import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import JobApplicationDialog from "./job-application-dialog"
import JobApplicationRow from "./job-application-row"
import { useJobApplications } from "@/hooks/use-job-applications"

const JobApplicationList = () => {
  const {
    jobApplications,
    isLoading,
    fetchJobApplications,
    deleteApplication,
    changeStatus,
    changeStage,
    revive,
  } = useJobApplications()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Mis solicitudes de trabajo</h1>
          <span className="text-sm text-muted-foreground">
            Registra cada vacante, filtra tus procesos y mantén su estado al
            día.
          </span>
        </div>
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
            {jobApplications.map((jobApplication) => (
              <JobApplicationRow
                key={jobApplication.id}
                jobApplication={jobApplication}
                handleStageChange={changeStage}
                handleStatusChange={changeStatus}
                handleRevive={revive}
                onDelete={deleteApplication}
                fetchJobApplications={fetchJobApplications}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default JobApplicationList
