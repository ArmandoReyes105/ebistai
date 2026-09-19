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
    updateStatus,
    updateStage,
  } = useJobApplications()

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
              <JobApplicationRow
                key={key}
                jobApplication={jobApplication}
                handleStageChange={updateStage}
                handleStatusChange={updateStatus}
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
