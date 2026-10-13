"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import UpdateApplicationForm from "./update-application-form"
import { JobApplication } from "@/types/job-application.types"

interface UpdateApplicationDialogProps {
  application: JobApplication | null
  onCreated?: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const UpdateApplicationDialog = ({
  application,
  open,
  onCreated,
  onOpenChange,
}: UpdateApplicationDialogProps) => {
  if (application === null) return

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Actualizar solicitud de empleo</DialogTitle>
          <DialogDescription>
            Actualiza el puesto al que aplicaste.
          </DialogDescription>
        </DialogHeader>

        <UpdateApplicationForm
          application={application}
          onSuccess={() => {
            onOpenChange(false)
            onCreated?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default UpdateApplicationDialog
