"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import UpdateApplicationForm from "./update-application-form"
import { JobApplication } from "@/types/job-application.types"

interface UpdateApplicationDialogProps {
  application: JobApplication | null
  onCreated?: (updated?: JobApplication) => void
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
          onSuccess={(updated) => {
            onOpenChange(false)
            onCreated?.(updated)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default UpdateApplicationDialog
