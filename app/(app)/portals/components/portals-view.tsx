"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { toast } from "@/components/ui/toast"
import { usePortals } from "@/hooks/use-portals"
import { getErrorMessage } from "@/lib/api/error-messages"
import { safeHttpUrl } from "@/lib/safe-url"
import { Portal } from "@/types/portal.types"
import { Globe, Plus, SquareArrowOutUpRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import PortalDialog from "./portal-dialog"

const LABEL = "font-mono text-xs tracking-wider text-muted-foreground uppercase"

interface PortalCardProps {
  portal: Portal
  onEdit: () => void
  onDelete: () => void
}

const PortalCard = ({ portal, onEdit, onDelete }: PortalCardProps) => {
  const url = safeHttpUrl(portal.url)

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
        <h3 className={LABEL}>Postulaciones</h3>
        {portal.applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no sigues ninguna aquí.
          </p>
        ) : (
          <ul className="flex flex-col">
            {portal.applications.map((application) => (
              <li key={application.id}>
                <Link
                  href={`/job-applications/${application.id}`}
                  className="flex min-h-11 items-center gap-1 text-sm hover:underline"
                >
                  <span className="font-medium wrap-anywhere">
                    {application.jobTitle}
                  </span>
                  <span className="wrap-anywhere text-muted-foreground">
                    · {application.company}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-muted pt-3">
        {url && (
          <Button
            variant="outline"
            className="h-11 px-4 text-sm"
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
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {portals.map((portal) => (
            <PortalCard
              key={portal.id}
              portal={portal}
              onEdit={() => setEditing(portal)}
              onDelete={() => setDeleting(portal)}
            />
          ))}
        </div>
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

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Seguro que quieres eliminarlo?</AlertDialogTitle>
            <AlertDialogDescription>
              Vamos a borrar <span className="font-bold">{deleting?.name}</span>
              . Tus postulaciones no se borran, solo se quedan sin portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mejor no</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleting) void confirmDelete(deleting)
              }}
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default PortalsView
