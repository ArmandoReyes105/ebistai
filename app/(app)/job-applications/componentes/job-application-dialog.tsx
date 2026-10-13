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
import { useState } from "react"
import JobApplicationForm from "./job-application-form"

interface JobApplicationDialogProps {
  onCreated?: () => void
}

const JobApplicationDialog = ({ onCreated }: JobApplicationDialogProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Agregar postulación</Button>} />

      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Agregar solicitud de empleo</DialogTitle>
          <DialogDescription>
            Registra un nuevo puesto al que aplicaste.
          </DialogDescription>
        </DialogHeader>

        <JobApplicationForm
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
