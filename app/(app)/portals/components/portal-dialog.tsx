"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  FORM_CAPTION_CLASS,
  FORM_CONTROL_CLASS,
  FORM_LABEL_CLASS,
} from "@/components/form-classes"
import { getErrorMessage } from "@/lib/api/error-messages"
import {
  PORTAL_ACCESS_WARNING,
  portalHost,
  portalTags,
} from "@/lib/domain/portal-list"
import {
  PORTAL_NOTES_MAX_LENGTH,
  PortalFormValues,
  portalSchema,
} from "@/schemas/portal"
import { Portal, SavePortalRequest } from "@/types/portal.types"
import { zodResolver } from "@hookform/resolvers/zod"
import { XIcon } from "lucide-react"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import PortalPreview, {
  PORTAL_DIALOG_FOOTER_CLASS,
  PORTAL_DIALOG_HEADER_CLASS,
} from "./portal-preview"

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
  const [name, url, notes] = useWatch({
    control: form.control,
    name: ["name", "url", "notes"],
  })

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

  const previewName = name.trim() || "Portal"
  const formNoteId = "portal-form-note"

  return (
    <>
      <header className={PORTAL_DIALOG_HEADER_CLASS}>
        <div className="min-w-0">
          <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
            {portal ? "Editar portal" : "Nuevo portal"}
            <span className="text-primary">.</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            El sitio de la empresa donde sigues tu proceso.
          </DialogDescription>
        </div>
        <DialogClose
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0"
              aria-label="Cerrar"
            />
          }
        >
          <XIcon className="size-4" />
        </DialogClose>
      </header>

      <PortalPreview
        label={portal ? "Así se ve hoy" : "Vista previa"}
        name={previewName}
        host={portalHost(url) || "Enlace del sitio"}
        tags={portalTags(portal)}
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.name !== undefined}>
              <FieldLabel htmlFor="portal-name" className={FORM_LABEL_CLASS}>
                Nombre
              </FieldLabel>
              <Input
                id="portal-name"
                aria-invalid={errors.name !== undefined}
                placeholder="Ej. Portal de la empresa"
                autoComplete="off"
                className={FORM_CONTROL_CLASS}
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={errors.url !== undefined}>
              <FieldLabel htmlFor="portal-url" className={FORM_LABEL_CLASS}>
                Enlace
              </FieldLabel>
              <Input
                id="portal-url"
                type="url"
                inputMode="url"
                aria-invalid={errors.url !== undefined}
                placeholder="https://"
                autoComplete="off"
                className={FORM_CONTROL_CLASS}
                {...form.register("url")}
              />
              <FieldError errors={[errors.url]} />
            </Field>
          </div>

          <Field data-invalid={errors.notes !== undefined}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="portal-notes" className={FORM_LABEL_CLASS}>
                Notas
              </FieldLabel>
              <span className={FORM_CAPTION_CLASS}>
                {notes?.length ?? 0} / {PORTAL_NOTES_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="portal-notes"
              aria-invalid={errors.notes !== undefined}
              aria-describedby={formNoteId}
              maxLength={PORTAL_NOTES_MAX_LENGTH}
              placeholder="Qué revisar aquí, cada cuánto actualizan"
              className="max-h-48 min-h-24 text-base sm:text-sm md:text-sm"
              {...form.register("notes")}
            />
            <FieldError errors={[errors.notes]} />
          </Field>
        </div>

        <footer className={PORTAL_DIALOG_FOOTER_CLASS}>
          <p
            id={formNoteId}
            className="text-xs text-pretty text-muted-foreground"
          >
            {PORTAL_ACCESS_WARNING}
          </p>
          <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-4 text-sm"
                />
              }
            >
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 bg-foreground px-4 text-sm font-semibold text-background hover:bg-foreground/90"
            >
              {isSubmitting ? "Guardando..." : "Guardar portal"}
            </Button>
          </div>
        </footer>
      </form>
    </>
  )
}

const PortalDialog = ({ open, onOpenChange, ...props }: PortalDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      showCloseButton={false}
      className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 text-sm sm:max-w-140"
    >
      {/* Mounted only while open, so it always starts from the saved values. */}
      {open && <PortalForm onOpenChange={onOpenChange} {...props} />}
    </DialogContent>
  </Dialog>
)

export default PortalDialog
