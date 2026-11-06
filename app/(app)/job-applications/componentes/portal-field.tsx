"use client"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/ui/autocomplete"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { usePortals } from "@/hooks/use-portals"
import { getErrorMessage } from "@/lib/api/error-messages"
import {
  findPortalByName,
  portalSearchItems,
  resolvePortalSearch,
} from "@/lib/domain/portal-list"
import { portalSchema } from "@/schemas/portal"
import { JobApplicationFormValues } from "@/schemas/job-application"
import { Plus, XIcon } from "lucide-react"
import { KeyboardEvent, useState } from "react"
import { Control, Controller } from "react-hook-form"
import {
  FORM_CAPTION_CLASS,
  FORM_CONTROL_CLASS,
  FORM_LABEL_CLASS,
} from "./application-form-classes"

interface PortalFieldProps {
  control: Control<JobApplicationFormValues>
  // Keeps the name visible while the list loads, or if it fails.
  current?: { id: string; name: string }
}

const PortalField = ({ control, current }: PortalFieldProps) => {
  const { portals, isLoading, createPortal } = usePortals()
  const [search, setSearch] = useState(current?.name ?? "")
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({})

  const isUnknown =
    !isLoading &&
    search.trim() !== "" &&
    search !== current?.name &&
    !findPortalByName(portals, search)

  function openForm() {
    if (isUnknown) setName(search.trim())
    setIsAdding(true)
  }

  function closeForm() {
    setIsAdding(false)
    setName("")
    setUrl("")
    setErrors({})
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
      setSearch(created.name)
      closeForm()
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
              <FieldLabel htmlFor={field.name} className={FORM_LABEL_CLASS}>
                Portal de seguimiento
              </FieldLabel>
              {!isAdding && (
                <button
                  type="button"
                  onClick={openForm}
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  <Plus className="size-4" />
                  Agregar portal
                </button>
              )}
            </div>

            <Autocomplete
              items={portalSearchItems(portals)}
              value={search}
              openOnInputClick
              onValueChange={(value: string) => {
                const resolved = resolvePortalSearch(portals, value)
                setSearch(resolved.search)
                field.onChange(resolved.portalId)
              }}
            >
              <AutocompleteInput
                id={field.name}
                aria-describedby={isUnknown ? "portal-unknown" : undefined}
                placeholder="Sin portal. Busca por nombre"
                autoComplete="off"
                className={FORM_CONTROL_CLASS}
              />
              <AutocompleteContent>
                <AutocompleteEmpty>Sin coincidencias.</AutocompleteEmpty>
                <AutocompleteList>
                  {(item: string) => (
                    <AutocompleteItem key={item} value={item}>
                      {item}
                    </AutocompleteItem>
                  )}
                </AutocompleteList>
              </AutocompleteContent>
            </Autocomplete>

            <div aria-live="polite">
              {isUnknown && (
                <p
                  id="portal-unknown"
                  className="text-xs text-pretty text-muted-foreground"
                >
                  No tienes un portal con ese nombre. La postulación se guardará
                  sin portal.
                </p>
              )}
            </div>

            {isAdding && (
              <div className="flex flex-col gap-3 border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className={FORM_CAPTION_CLASS}>Nuevo portal</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={closeForm}
                    aria-label="Cerrar sin agregar el portal"
                    className="size-11 shrink-0"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
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
                      placeholder="Ej. Portal de la empresa"
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
