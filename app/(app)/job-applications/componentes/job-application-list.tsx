"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useJobApplicationFilters } from "@/hooks/use-job-application-filters"
import { useJobApplicationSources } from "@/hooks/use-job-application-sources"
import { useJobApplications } from "@/hooks/use-job-applications"
import { cn } from "@/lib/utils"
import { JobApplication } from "@/types/job-application.types"
import {
  ArrowLeftIcon,
  BriefcaseBusinessIcon,
  SearchXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import JobApplicationDialog from "./job-application-dialog"
import JobApplicationFiltersBar from "./job-application-filters"
import JobApplicationPagination from "./job-application-pagination"
import JobApplicationRow from "./job-application-row"
import { hasActiveFilters } from "@/lib/domain/job-application-query"

const SKELETON_ROWS = 8

const JobApplicationList = () => {
  const { filters, update, clear } = useJobApplicationFilters()
  const [sourcesVersion, setSourcesVersion] = useState(0)
  const sources = useJobApplicationSources(sourcesVersion)

  const {
    data,
    isInitialLoading,
    isFetching,
    reload,
    replaceApplication,
    deleteApplication,
    changeStage,
    changeStatus,
    revive,
  } = useJobApplications({
    filters,
    onPageEmptied: () => update({ page: Math.max(1, filters.page - 1) }),
  })

  // A URL (or a deletion) can leave us past the last page: step back to it.
  const totalPages = data?.totalPages ?? 0
  const isPastEnd = totalPages > 0 && filters.page > totalPages
  useEffect(() => {
    if (isPastEnd) update({ page: totalPages })
  }, [isPastEnd, totalPages, update])

  const handleCreated = () => {
    setSourcesVersion((v) => v + 1)
    reload()
  }

  const handleUpdated = (updated?: JobApplication) => {
    setSourcesVersion((v) => v + 1)
    if (updated) replaceApplication(updated)
    else reload()
  }

  const filtersActive = hasActiveFilters(filters)
  const items = data?.items ?? []
  const noApplicationsAtAll =
    data !== null && data.totalCount === 0 && !filtersActive
  const noResults = data !== null && items.length === 0 && filtersActive
  const noResultsVisible = noResults && !isFetching
  const loadFailed = data === null && !isFetching

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <Link
            href="/dashboard"
            className="mb-2 flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Volver al dashboard
          </Link>
          <h1 className="text-2xl font-bold">Mis solicitudes de trabajo</h1>
          <span className="text-sm text-muted-foreground">
            Registra cada vacante, filtra tus procesos y mantén su estado al
            día.
          </span>
        </div>
        <JobApplicationDialog onCreated={handleCreated} />
      </div>

      {!noApplicationsAtAll && (
        <div className="shrink-0">
          <JobApplicationFiltersBar
            filters={filters}
            sources={sources}
            onChange={update}
            onClear={clear}
          />
        </div>
      )}

      {/* The card is the only thing that grows; the body scrolls, the footer stays. */}
      <div className="flex min-h-0 flex-1 flex-col">
        {loadFailed ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TriangleAlertIcon />
              </EmptyMedia>
              <EmptyTitle>Uy, no pudimos traer tus postulaciones</EmptyTitle>
              <EmptyDescription>
                Revisa tu conexión y lo intentamos otra vez.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={reload}>
                Reintentar
              </Button>
            </EmptyContent>
          </Empty>
        ) : noApplicationsAtAll ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BriefcaseBusinessIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no tienes postulaciones</EmptyTitle>
              <EmptyDescription>
                Registra tu primera vacante y aquí te ayudamos a seguirle la
                pista a cada paso.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <JobApplicationDialog onCreated={handleCreated} />
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {noResultsVisible ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchXIcon />
                  </EmptyMedia>
                  <EmptyTitle>Nada por aquí con estos filtros</EmptyTitle>
                  <EmptyDescription>
                    Prueba con otra búsqueda o quita algún filtro, a ver qué
                    sale.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" onClick={clear}>
                    Limpiar filtros
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <Table
                containerClassName="min-h-0 flex-1 overflow-auto"
                className={cn(
                  "transition-opacity",
                  isFetching && !isInitialLoading && "opacity-60"
                )}
                aria-busy={isFetching}
              >
                <TableCaption className="sr-only">
                  Lista de puestos solicitados
                </TableCaption>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]">
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
                  {isInitialLoading
                    ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={7}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    : items.map((jobApplication) => (
                        <JobApplicationRow
                          key={jobApplication.id}
                          jobApplication={jobApplication}
                          handleStageChange={changeStage}
                          handleStatusChange={changeStatus}
                          handleRevive={revive}
                          onDelete={deleteApplication}
                          onUpdated={handleUpdated}
                        />
                      ))}
                </TableBody>
              </Table>
            )}

            <JobApplicationPagination
              page={filters.page}
              pageSize={filters.pageSize}
              totalCount={data?.totalCount ?? 0}
              totalPages={totalPages}
              isFetching={isFetching}
              onPageChange={(page) => update({ page })}
              onPageSizeChange={(pageSize) => update({ pageSize })}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default JobApplicationList
