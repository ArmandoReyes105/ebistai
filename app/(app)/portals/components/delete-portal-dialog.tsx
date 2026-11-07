"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { portalHost, portalTags } from "@/lib/domain/portal-list"
import { Portal } from "@/types/portal.types"
import { cn } from "cn"
import { XIcon } from "lucide-react"
import PortalPreview, {
  PORTAL_DIALOG_FOOTER_CLASS,
  PORTAL_DIALOG_HEADER_CLASS,
} from "./portal-preview"

interface DeletePortalDialogProps {
  // The dialog stays open while there is a portal to confirm.
  portal: Portal | null
  onCancel: () => void
  onConfirm: (portal: Portal) => void
}

const DeletePortalDialog = ({
  portal,
  onCancel,
  onConfirm,
}: DeletePortalDialogProps) => (
  <AlertDialog
    open={portal !== null}
    onOpenChange={(open) => {
      if (!open) onCancel()
    }}
  >
    <AlertDialogContent className="flex flex-col gap-0 overflow-hidden p-0 text-sm data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-140">
      {portal && (
        <>
          <header className={PORTAL_DIALOG_HEADER_CLASS}>
            <AlertDialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
              Eliminar portal<span className="text-primary">.</span>
            </AlertDialogTitle>
            <AlertDialogCancel
              size="icon"
              className="size-11 shrink-0"
              aria-label="Cerrar"
            >
              <XIcon className="size-4" />
            </AlertDialogCancel>
          </header>

          <PortalPreview
            label="Portal a eliminar"
            name={portal.name}
            host={portalHost(portal.url)}
            tags={portalTags(portal)}
          />

          <div className="flex flex-col gap-2 p-4 sm:p-6">
            <p className="text-[17px] font-semibold">
              ¿Seguro que quieres eliminarlo?
            </p>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Tus postulaciones no se borran, solo se quedan sin portal.
            </AlertDialogDescription>
          </div>

          <footer className={cn(PORTAL_DIALOG_FOOTER_CLASS, "sm:justify-end")}>
            <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
              <AlertDialogCancel className="h-11 px-4 text-sm">
                Mejor no
              </AlertDialogCancel>
              <AlertDialogAction
                className="h-11 px-4 text-sm font-semibold"
                onClick={() => onConfirm(portal)}
              >
                Sí, eliminar
              </AlertDialogAction>
            </div>
          </footer>
        </>
      )}
    </AlertDialogContent>
  </AlertDialog>
)

export default DeletePortalDialog
