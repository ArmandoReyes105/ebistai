"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { JobApplication } from "@/types/job-application.types"
import ApplicationForm from "./application-form"
import { APPLICATION_DIALOG_CLASS } from "./application-form-classes"

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
      <DialogContent
        showCloseButton={false}
        className={APPLICATION_DIALOG_CLASS}
      >
        <ApplicationForm
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
