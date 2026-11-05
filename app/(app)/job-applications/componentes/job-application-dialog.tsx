"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import ApplicationForm from "./application-form"
import { APPLICATION_DIALOG_CLASS } from "./application-form-classes"

interface JobApplicationDialogProps {
  onCreated?: () => void
}

const JobApplicationDialog = ({ onCreated }: JobApplicationDialogProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-12 gap-2.5 bg-foreground px-[22px] text-[15px] font-semibold text-background hover:bg-foreground/90">
            <PlusIcon className="size-[18px]" />
            Nueva postulación
          </Button>
        }
      />

      <DialogContent
        showCloseButton={false}
        className={APPLICATION_DIALOG_CLASS}
      >
        <ApplicationForm
          onSuccess={() => {
            setOpen(false)
            onCreated?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default JobApplicationDialog
