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
          <AlertDialogTitle>¿Seguro que quieres eliminarla?</AlertDialogTitle>
          <AlertDialogDescription>
            Vamos a borrar para siempre tu postulación
            {application !== null && (
              <>
                {" "}
                a <span className="font-bold">{application.jobTitle}</span>
              </>
            )}
            . Esto ya no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Mejor no</AlertDialogCancel>
          <AlertDialogAction
            variant={"destructive"}
            onClick={() => {
              onConfirm(application.id)
              onOpenChange(false)
            }}
          >
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteApplicationDialog
