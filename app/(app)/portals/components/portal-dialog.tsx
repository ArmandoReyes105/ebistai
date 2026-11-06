"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { getErrorMessage } from "@/lib/api/error-messages"
import {
  PORTAL_NOTES_MAX_LENGTH,
  PortalFormValues,
  portalSchema,
} from "@/schemas/portal"
import { Portal, SavePortalRequest } from "@/types/portal.types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

interface PortalDialogProps {
  // Without it, the dialog creates a new portal.
  portal?: Portal
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: SavePortalRequest) => Promise<unknown>
}

const PortalForm = ({
  portal,
  onOpenChange,
  onSave,
}: Omit<PortalDialogProps, "open">) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<PortalFormValues>({
    resolver: zodResolver(portalSchema),
    defaultValues: {
      name: portal?.name ?? "",
      url: portal?.url ?? "",
      notes: portal?.notes ?? "",
    },
  })
  const { errors } = form.formState

  async function onSubmit(values: PortalFormValues) {
    setIsSubmitting(true)
    try {
      await onSave({
        name: values.name,
        url: values.url,
        notes: values.notes || undefined,
      })
      toast.add({
        title: "¡Listo!",
        description: portal
          ? "Tu portal ya está al día."
          : "Ya guardamos tu portal.",
        type: "success",
      })
      onOpenChange(false)
    } catch (error) {
      toast.add({
        title: "Uy",
        description: getErrorMessage(
          error,
          "No pudimos guardar el portal. ¿Le damos otra vez?"
        ),
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>{portal ? "Editar portal" : "Nuevo portal"}</DialogTitle>
        <DialogDescription>
          El sitio de la empresa donde sigues tu proceso.
        </DialogDescription>
      </DialogHeader>

      <Field data-invalid={errors.name !== undefined}>
        <FieldLabel htmlFor="portal-name">Nombre</FieldLabel>
        <Input
          id="portal-name"
          aria-invalid={errors.name !== undefined}
          placeholder="Ej. Portal de la empresa"
          autoComplete="off"
          {...form.register("name")}
        />
        <FieldError errors={[errors.name]} />
      </Field>

      <Field data-invalid={errors.url !== undefined}>
        <FieldLabel htmlFor="portal-url">Enlace</FieldLabel>
        <Input
          id="portal-url"
          type="url"
          inputMode="url"
          aria-invalid={errors.url !== undefined}
          placeholder="https://"
          autoComplete="off"
          {...form.register("url")}
        />
        <FieldError errors={[errors.url]} />
      </Field>

      <Field data-invalid={errors.notes !== undefined}>
        <FieldLabel htmlFor="portal-notes">Notas</FieldLabel>
        <Textarea
          id="portal-notes"
          aria-invalid={errors.notes !== undefined}
          aria-describedby="portal-notes-help"
          maxLength={PORTAL_NOTES_MAX_LENGTH}
          className="max-h-48 min-h-24"
          {...form.register("notes")}
        />
        <p id="portal-notes-help" className="text-xs text-muted-foreground">
          No guardes contraseñas ni datos de acceso aquí.
        </p>
        <FieldError errors={[errors.notes]} />
      </Field>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar portal"}
        </Button>
      </DialogFooter>
    </form>
  )
}

const PortalDialog = ({ open, onOpenChange, ...props }: PortalDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      {/* Mounted only while open, so it always starts from the saved values. */}
      {open && <PortalForm onOpenChange={onOpenChange} {...props} />}
    </DialogContent>
  </Dialog>
)

export default PortalDialog
