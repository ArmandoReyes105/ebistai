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
import { useApplicationsSummary } from "@/hooks/use-applications-summary"
import { useJobApplicationFilters } from "@/hooks/use-job-application-filters"
import { useJobApplicationSources } from "@/hooks/use-job-application-sources"
import { useJobApplications } from "@/hooks/use-job-applications"
import { useRadarThreshold } from "@/hooks/use-radar-threshold"
import { cn } from "@/lib/utils"
import { JobApplication } from "@/types/job-application.types"
import {
  BriefcaseBusinessIcon,
  SearchXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import ApplicationsSummaryTiles from "./applications-summary-tiles"
import JobApplicationDialog from "./job-application-dialog"
import JobApplicationFiltersBar from "./job-application-filters"
import JobApplicationPagination from "./job-application-pagination"
import JobApplicationRow from "./job-application-row"
import { hasActiveFilters } from "@/lib/domain/job-application-query"

const SKELETON_ROWS = 8

// "23 postulaciones · 14 activas", or "8 resultados con filtros" while filtering.
const countLabel = (
  count: number,
  filtered: boolean,
  activeCount: number | null
) => {
  if (filtered) {
    return `${count} ${count === 1 ? "resultado" : "resultados"} con filtros`
  }
  const total = `${count} ${count === 1 ? "postulación" : "postulaciones"}`
  if (activeCount === null) return total
  return `${total} · ${activeCount} ${activeCount === 1 ? "activa" : "activas"}`
}

const headClassName =
  "px-3 py-4 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase"

const JobApplicationList = () => {
  const { filters, update, clear } = useJobApplicationFilters()
  const [sourcesVersion, setSourcesVersion] = useState(0)
  const sources = useJobApplicationSources(sourcesVersion)
  // Fetched once here and passed down; never call it per row.
  const staleThreshold = useRadarThreshold()
  const summary = useApplicationsSummary()
  const reloadSummary = summary.reload

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
    // Stage/status/revive changes and toast undos move the tile numbers.
    onApplicationChanged: reloadSummary,
  })

  // A URL (or a deletion) can leave us past the last page: step back to it.
  const totalPages = data?.totalPages ?? 0
  const isPastEnd = totalPages > 0 && filters.page > totalPages
  useEffect(() => {
    if (isPastEnd) update({ page: totalPages })
  }, [isPastEnd, totalPages, update])

  // Each mutation changes the tile numbers: refresh them once it completes.
  const handleCreated = () => {
    setSourcesVersion((v) => v + 1)
    reload()
    reloadSummary()
  }

  const handleUpdated = (updated?: JobApplication) => {
    setSourcesVersion((v) => v + 1)
    if (updated) replaceApplication(updated)
    else reload()
    reloadSummary()
  }

  const handleDelete = async (id: string) => {
    await deleteApplication(id)
    reloadSummary()
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
      <header className="mb-2 flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          {/* Reserves its line while loading so the title does not jump. */}
          <span className="min-h-4 font-mono text-xs tracking-wider text-muted-foreground uppercase tabular-nums">
            {data &&
              countLabel(data.totalCount, filtersActive, summary.activeCount)}
          </span>
          <h1 className="text-3xl leading-none font-semibold tracking-[-0.04em] md:text-4xl">
            Postulaciones<span className="text-primary">.</span>
          </h1>
        </div>
        <JobApplicationDialog onCreated={handleCreated} />
      </header>

      {!noApplicationsAtAll && (
        <div className="shrink-0">
          <ApplicationsSummaryTiles
            attention={summary.attention}
            activeCount={summary.activeCount}
            closedCount={summary.closedCount}
            thresholdDays={summary.thresholdDays}
            isLoading={summary.isLoading}
            state={filters.state}
            onChange={update}
          />
        </div>
      )}

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

      {/* The card is the only thing that grows; the body scrolls, the footer
          stays. The min-height fits the header, 5 rows (~74px each) and the
          pagination, so short screens scroll the whole page instead. */}
      <div className="flex min-h-[32rem] flex-1 flex-col">
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
                containerClassName="scrollbar-ui min-h-0 flex-1 overflow-auto border border-border bg-card"
                className={cn(
                  "min-w-[980px] text-[15px] transition-opacity",
                  isFetching && !isInitialLoading && "opacity-60"
                )}
                aria-busy={isFetching}
              >
                <TableCaption className="sr-only">
                  Lista de puestos solicitados
                </TableCaption>
                <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_var(--border)]">
                  <TableRow className="border-b border-border">
                    <TableHead className={cn(headClassName, "px-5")}>
                      Puesto
                    </TableHead>
                    <TableHead className={headClassName}>Empresa</TableHead>
                    <TableHead className={headClassName}>Etapa</TableHead>
                    <TableHead className={headClassName}>Estado</TableHead>
                    <TableHead className={headClassName}>Modalidad</TableHead>
                    <TableHead className={headClassName}>Fuente</TableHead>
                    <TableHead className={cn(headClassName, "px-5 text-right")}>
                      Último avance
                    </TableHead>
                    <TableHead className={cn(headClassName, "w-14 px-0")}>
                      <span className="sr-only">Opciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isInitialLoading
                    ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                        <TableRow key={i} className="border-b border-muted">
                          <TableCell colSpan={8} className="px-5 py-4">
                            <Skeleton className="h-11 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    : items.map((jobApplication) => (
                        <JobApplicationRow
                          key={jobApplication.id}
                          jobApplication={jobApplication}
                          staleThreshold={staleThreshold}
                          handleStageChange={changeStage}
                          handleStatusChange={changeStatus}
                          handleRevive={revive}
                          onDelete={handleDelete}
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
