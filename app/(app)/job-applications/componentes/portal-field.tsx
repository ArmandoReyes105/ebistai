"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { usePortals } from "@/hooks/use-portals"
import { getErrorMessage } from "@/lib/api/error-messages"
import { portalSchema } from "@/schemas/portal"
import { JobApplicationFormValues } from "@/schemas/job-application"
import { Plus } from "lucide-react"
import { KeyboardEvent, useState } from "react"
import { Control, Controller } from "react-hook-form"
import {
  FORM_CAPTION_CLASS,
  FORM_CONTROL_CLASS,
  FORM_LABEL_CLASS,
} from "./application-form-classes"

const NO_PORTAL = "none"

interface PortalFieldProps {
  control: Control<JobApplicationFormValues>
  // Keeps the name visible while the list loads, or if it fails.
  current?: { id: string; name: string }
}

const PortalField = ({ control, current }: PortalFieldProps) => {
  const { portals, createPortal } = usePortals()
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({})

  const items = [
    { value: NO_PORTAL, label: "Sin portal" },
    ...portals.map((portal) => ({ value: portal.id, label: portal.name })),
  ]
  if (current && !portals.some((portal) => portal.id === current.id)) {
    items.push({ value: current.id, label: current.name })
  }

  async function addPortal(onCreated: (id: string) => void) {
    const parsed = portalSchema.safeParse({ name, url })
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors
      setErrors({ name: fields.name?.[0], url: fields.url?.[0] })
      return
    }

    setIsSaving(true)
    try {
      const created = await createPortal(parsed.data)
      onCreated(created.id)
      setName("")
      setUrl("")
      setErrors({})
      setIsAdding(false)
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
      setIsSaving(false)
    }
  }

  return (
    <Controller
      name="portalId"
      control={control}
      render={({ field }) => {
        // Enter here must add the portal, not submit the application.
        const addOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key !== "Enter") return
          event.preventDefault()
          void addPortal(field.onChange)
        }

        return (
          <Field>
            <div className="flex items-center justify-between gap-2">
              <span id="application-form-portal" className={FORM_LABEL_CLASS}>
                Portal de seguimiento
              </span>
              <button
                type="button"
                onClick={() => setIsAdding((open) => !open)}
                aria-expanded={isAdding}
                className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                <Plus className="size-4" />
                Agregar portal
              </button>
            </div>

            <Select
              items={items}
              value={field.value || NO_PORTAL}
              onValueChange={(value) =>
                field.onChange(value === NO_PORTAL ? "" : value)
              }
            >
              <SelectTrigger
                aria-labelledby="application-form-portal"
                className={`w-full ${FORM_CONTROL_CLASS}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {isAdding && (
              <div className="flex flex-col gap-3 border border-border p-3">
                <p className={FORM_CAPTION_CLASS}>Nuevo portal</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field data-invalid={errors.name !== undefined}>
                    <FieldLabel
                      htmlFor="new-portal-name"
                      className={FORM_LABEL_CLASS}
                    >
                      Nombre
                    </FieldLabel>
                    <Input
                      id="new-portal-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onKeyDown={addOnEnter}
                      aria-invalid={errors.name !== undefined}
                      placeholder="Ej. Banamex"
                      autoComplete="off"
                      className={FORM_CONTROL_CLASS}
                    />
                    {errors.name && (
                      <FieldError errors={[{ message: errors.name }]} />
                    )}
                  </Field>
                  <Field data-invalid={errors.url !== undefined}>
                    <FieldLabel
                      htmlFor="new-portal-url"
                      className={FORM_LABEL_CLASS}
                    >
                      Enlace
                    </FieldLabel>
                    <Input
                      id="new-portal-url"
                      type="url"
                      inputMode="url"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      onKeyDown={addOnEnter}
                      aria-invalid={errors.url !== undefined}
                      placeholder="https://"
                      autoComplete="off"
                      className={FORM_CONTROL_CLASS}
                    />
                    {errors.url && (
                      <FieldError errors={[{ message: errors.url }]} />
                    )}
                  </Field>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-pretty text-muted-foreground">
                    Solo guardamos cómo llegar al sitio, nunca tus datos de
                    acceso.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => void addPortal(field.onChange)}
                    className="h-11 px-4 text-sm"
                  >
                    {isSaving ? "Guardando..." : "Guardar portal"}
                  </Button>
                </div>
              </div>
            )}
          </Field>
        )
      }}
    />
  )
}

export default PortalField
