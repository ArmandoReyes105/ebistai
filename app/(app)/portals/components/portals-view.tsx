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
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { usePortals } from "@/hooks/use-portals"
import { getErrorMessage } from "@/lib/api/error-messages"
import {
  stageBadgeConfig,
  statusBadgeConfig,
} from "@/lib/components/badge-config"
import {
  filterPortals,
  portalCounts,
  sortPortals,
  splitApplications,
} from "@/lib/domain/portal-list"
import { safeHttpUrl } from "@/lib/safe-url"
import { Portal, PortalApplication } from "@/types/portal.types"
import { cn } from "cn"
import { Globe, Plus, SquareArrowOutUpRight } from "lucide-react"
import Link from "next/link"
import { ReactNode, useState } from "react"
import DeletePortalDialog from "./delete-portal-dialog"
import PortalDialog from "./portal-dialog"

const LABEL = "font-mono text-xs tracking-wider text-muted-foreground uppercase"

interface ApplicationListProps {
  applications: PortalApplication[]
  stateOf: (application: PortalApplication) => ReactNode
}

const ApplicationList = ({ applications, stateOf }: ApplicationListProps) => (
  <ul className="flex flex-col">
    {applications.map((application) => (
      <li key={application.id}>
        <Link
          href={`/job-applications/${application.id}`}
          className="flex min-h-11 items-center justify-between gap-3 text-sm hover:underline"
        >
          <span className="min-w-0 wrap-anywhere">
            <span className="font-medium">{application.jobTitle}</span>
            <span className="text-muted-foreground">
              {" "}
              · {application.company}
            </span>
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {stateOf(application)}
          </span>
        </Link>
      </li>
    ))}
  </ul>
)

interface PortalCardProps {
  portal: Portal
  onEdit: () => void
  onDelete: () => void
}

const PortalCard = ({ portal, onEdit, onDelete }: PortalCardProps) => {
  const url = safeHttpUrl(portal.url)
  const { active, closed } = splitApplications(portal)
  const counts = portalCounts(portal)

  return (
    <section className="flex min-w-0 flex-col gap-3 border border-border bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold wrap-anywhere">{portal.name}</h2>
        <p className="text-sm wrap-anywhere text-muted-foreground">
          {portal.url}
        </p>
      </div>

      {portal.notes && (
        <p className="bg-muted px-3.5 py-3 text-sm wrap-anywhere whitespace-pre-wrap">
          {portal.notes}
        </p>
      )}

      <div className="flex flex-col gap-1 border-t border-muted pt-3">
        <h3 className={LABEL}>
          {portal.applications.length === 0 ? (
            "Sin postulaciones"
          ) : (
            <>
              <span
                className={cn(
                  counts.hasActive && "font-semibold text-foreground"
                )}
              >
                {counts.active}
              </span>
              {` · ${counts.closed}`}
            </>
          )}
        </h3>
        {portal.applications.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aún no sigues ninguna aquí.
          </p>
        )}
        {active.length > 0 && (
          <ApplicationList
            applications={active}
            stateOf={(a) => stageBadgeConfig[a.stage].label}
          />
        )}
        {closed.length > 0 && (
          <details>
            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-muted-foreground">
              Ver cerradas ({closed.length})
            </summary>
            <ApplicationList
              applications={closed}
              stateOf={(a) => statusBadgeConfig[a.status].label}
            />
          </details>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-muted pt-3">
        {url && (
          <Button
            variant="outline"
            className="h-11 px-4 text-sm"
            nativeButton={false}
            render={<a href={url} target="_blank" rel="noopener noreferrer" />}
          >
            <SquareArrowOutUpRight /> Abrir portal
          </Button>
        )}
        <Button variant="ghost" className="h-11 px-4 text-sm" onClick={onEdit}>
          Editar
        </Button>
        <Button
          variant="ghost"
          className="h-11 px-4 text-sm text-destructive"
          onClick={onDelete}
        >
          Eliminar
        </Button>
      </div>
    </section>
  )
}

const PortalsView = () => {
  const {
    portals,
    isLoading,
    hasError,
    reload,
    createPortal,
    updatePortal,
    deletePortal,
  } = usePortals()
  const [isCreating, setIsCreating] = useState(false)
  const [editing, setEditing] = useState<Portal | null>(null)
  const [deleting, setDeleting] = useState<Portal | null>(null)
  const [search, setSearch] = useState("")

  const visiblePortals = sortPortals(filterPortals(portals, search))

  async function confirmDelete(portal: Portal) {
    setDeleting(null)
    try {
      await deletePortal(portal.id)
      toast.add({
        title: "Listo",
        description: "Eliminamos el portal.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Uy",
        description: getErrorMessage(
          error,
          "No pudimos eliminar el portal. ¿Le damos otra vez?"
        ),
        type: "error",
      })
    }
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className={LABEL}>Donde sigues tus procesos</span>
          <h1 className="text-4xl leading-none font-semibold tracking-tighter">
            Mis portales<span className="text-primary">.</span>
          </h1>
        </div>
        <Button
          className="h-11 px-4 text-sm"
          onClick={() => setIsCreating(true)}
        >
          <Plus /> Agregar portal
        </Button>
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : hasError ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No pudimos cargar tus portales</EmptyTitle>
            <EmptyDescription>Puede ser algo momentáneo.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" className="h-11 px-4" onClick={reload}>
              Reintentar
            </Button>
          </EmptyContent>
        </Empty>
      ) : portals.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Globe />
            </EmptyMedia>
            <EmptyTitle>Aún no tienes portales</EmptyTitle>
            <EmptyDescription>
              Guarda aquí los sitios donde las empresas llevan tu proceso, para
              abrirlos sin buscar el enlace.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar portal por nombre"
            placeholder="Buscar por nombre"
            autoComplete="off"
            className="h-11 max-w-sm text-base sm:text-sm md:text-sm"
          />
          {visiblePortals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ningún portal coincide con tu búsqueda.
            </p>
          ) : (
            <div className="grid items-stretch gap-4 md:grid-cols-2">
              {visiblePortals.map((portal) => (
                <PortalCard
                  key={portal.id}
                  portal={portal}
                  onEdit={() => setEditing(portal)}
                  onDelete={() => setDeleting(portal)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <PortalDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSave={createPortal}
      />

      <PortalDialog
        key={editing?.id}
        portal={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        onSave={(data) => updatePortal(editing!.id, data)}
      />

      <DeletePortalDialog
        portal={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={(portal) => void confirmDelete(portal)}
      />
    </>
  )
}

export default PortalsView
