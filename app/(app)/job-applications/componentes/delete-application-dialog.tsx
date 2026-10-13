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
import { JobApplication } from "@/types/job-application.types"

interface DeleteApplicationDialogProps {
  open: boolean
  application: JobApplication
  onOpenChange: (open: boolean) => void
  onConfirm: (id: string) => void
}

const DeleteApplicationDialog = ({
  open,
  application,
  onConfirm,
  onOpenChange,
}: DeleteApplicationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente esta
            solicitud para{" "}
            {application !== null ? (
              <span className="font-bold">{application.jobTitle}</span>
            ) : undefined}
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant={"destructive"}
            onClick={() => {
              onConfirm(application.id)
              onOpenChange(false)
            }}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteApplicationDialog
