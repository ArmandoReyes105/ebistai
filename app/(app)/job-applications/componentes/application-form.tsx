"use client"

import TaiFigure from "@/components/tai/tai-figure"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { getErrorMessage } from "@/lib/api/error-messages"
import {
  stageBadgeConfig,
  statusBadgeConfig,
} from "@/lib/components/badge-config"
import { formatAppliedDate } from "@/lib/domain/application-preview"
import {
  JobApplicationFormValues,
  jobApplicationSchema,
  NOTES_MAX_LENGTH,
} from "@/schemas/job-application"
import { jobApplicationService } from "@/services/job-application-service"
import { Stage, Status, WorkMode } from "@/types/enums"
import { workModeOptions } from "@/types/enums-options"
import { JobApplication } from "@/types/job-application.types"
import { useAuth } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { es } from "date-fns/locale"
import { CalendarIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  FORM_CAPTION_CLASS,
  FORM_CONTROL_CLASS,
  FORM_LABEL_CLASS,
} from "./application-form-classes"
import ApplicationFormPreview from "./application-form-preview"
import CatalogAutocompleteField from "./catalog-autocomplete-field"
import PortalField from "./portal-field"

const MODE_ORDER = [WorkMode.Remote, WorkMode.Hybrid, WorkMode.OnSite]

const modeOptions = MODE_ORDER.flatMap((mode) =>
  workModeOptions.filter((option) => option.value === mode)
)

const EMPTY_VALUES: Partial<JobApplicationFormValues> = {
  jobTitle: "",
  company: "",
  jobPostingUrl: "",
  applicationSource: "",
  mode: undefined,
  dateApplied: "",
  notes: "",
  portalId: "",
}

const valuesOf = (
  application: JobApplication
): Partial<JobApplicationFormValues> => ({
  jobTitle: application.jobTitle,
  company: application.company,
  jobPostingUrl: application.jobPostingUrl ?? "",
  applicationSource: application.applicationSource,
  mode: application.mode,
  dateApplied: application.dateApplied
    ? new Date(application.dateApplied)
    : new Date(),
  notes: application.notes ?? "",
  portalId: application.portalId ?? "",
})

interface ApplicationFormProps {
  // Without it, the form creates a new application.
  application?: JobApplication
  // Receives the application when the server returns it.
  onSuccess: (saved?: JobApplication) => void
}

// The body of the create and edit dialogs. It renders three siblings (title,
// preview and form) for the grid in APPLICATION_DIALOG_CLASS.
const ApplicationForm = ({ application, onSuccess }: ApplicationFormProps) => {
  const { getToken } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const form = useForm<JobApplicationFormValues>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: application ? valuesOf(application) : EMPTY_VALUES,
  })

  const [jobTitle, company, notes] = useWatch({
    control: form.control,
    name: ["jobTitle", "company", "notes"],
  })

  const isEditing = application !== undefined
  const previewCompany = company.trim() || "Empresa"

  async function onSubmit(values: JobApplicationFormValues) {
    setIsSubmitting(true)
    try {
      const token = await getToken()
      const request = {
        jobTitle: values.jobTitle,
        company: values.company,
        jobPostingUrl: values.jobPostingUrl || undefined,
        applicationSource: values.applicationSource,
        mode: Number(values.mode) as WorkMode,
        notes: values.notes || undefined,
        portalId: values.portalId || undefined,
        dateApplied: values.dateApplied
          ? new Date(values.dateApplied)
          : new Date(),
      }
      const options = { token: token ?? undefined }

      const saved = isEditing
        ? await jobApplicationService.update(application.id, request, options)
        : await jobApplicationService.create(request, options)

      toast.add(
        isEditing
          ? {
              title: "¡Listo, cambios guardados!",
              description: "Tu postulación ya está al día.",
              type: "success",
            }
          : {
              title: "¡Listo, ya quedó registrada!",
              description:
                "Mucha suerte con esta. Aquí le seguimos la pista contigo.",
              type: "success",
            }
      )

      onSuccess(saved ?? undefined)
    } catch (error) {
      toast.add({
        title: "Uy",
        description: getErrorMessage(
          error,
          isEditing
            ? "No pudimos guardar los cambios. ¿Le damos otra vez?"
            : "No pudimos guardar tu postulación. ¿Le damos otra vez?"
        ),
        type: "error",
      })
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 sm:px-6 lg:col-start-2 lg:px-8 lg:py-4">
        <div className="min-w-0">
          <DialogTitle className="text-xl font-semibold tracking-tight lg:text-2xl">
            {isEditing ? "Editar postulación" : "Nueva postulación"}
            <span className="text-primary">.</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing
              ? "Actualiza los datos del puesto al que aplicaste."
              : "Registra el puesto al que aplicaste."}
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

      {isEditing ? (
        <ApplicationFormPreview
          label="Así se ve hoy"
          company={application.company}
          caption={`${application.company} · ${formatAppliedDate(new Date(application.dateApplied))}`}
          title={application.jobTitle}
          tags={[
            stageBadgeConfig[application.stage as Stage].label,
            statusBadgeConfig[application.status as Status].label,
          ]}
        >
          <p className="text-xs text-pretty text-background/70">
            La etapa y el estado se cambian desde el detalle.
          </p>
        </ApplicationFormPreview>
      ) : (
        <ApplicationFormPreview
          label="Así va a quedar"
          company={company}
          caption={`${previewCompany} · hoy`}
          title={jobTitle.trim() || "Puesto"}
          tags={[
            stageBadgeConfig[Stage.Applied].label,
            statusBadgeConfig[Status.Active].label,
          ]}
        >
          <TaiFigure
            pose="neutral"
            outlined={false}
            className="w-36 self-end [@media(max-height:700px)]:hidden"
          />
        </ApplicationFormPreview>
      )}

      <form
        id="form-job-application"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col lg:col-start-2"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid sm:grid-cols-2">
            <section
              aria-labelledby="application-form-offer"
              className="flex min-w-0 flex-col gap-4 p-4 sm:border-r sm:p-6 lg:px-8"
            >
              <h3 id="application-form-offer" className={FORM_CAPTION_CLASS}>
                01 · La oferta
              </h3>

              <Controller
                name="jobTitle"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className={FORM_LABEL_CLASS}
                    >
                      Puesto
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Ej. Frontend Developer"
                      autoComplete="off"
                      className={FORM_CONTROL_CLASS}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <CatalogAutocompleteField
                control={form.control}
                name="company"
                kind="companies"
                label="Empresa"
                placeholder="Ej. Nubia Labs"
              />

              <Controller
                name="jobPostingUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className={FORM_LABEL_CLASS}
                    >
                      Enlace de la oferta
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="url"
                      inputMode="url"
                      aria-invalid={fieldState.invalid}
                      placeholder="https://"
                      autoComplete="off"
                      className={FORM_CONTROL_CLASS}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </section>

            <section
              aria-labelledby="application-form-process"
              className="flex min-w-0 flex-col gap-4 px-4 pb-4 sm:p-6 lg:px-8"
            >
              <h3 id="application-form-process" className={FORM_CAPTION_CLASS}>
                02 · Cómo aplicaste
              </h3>

              <CatalogAutocompleteField
                control={form.control}
                name="applicationSource"
                kind="sources"
                label="Fuente"
                placeholder="Ej. Bolsa de empleo, referido"
              />

              <Controller
                name="mode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <span
                      id="application-form-mode"
                      className={FORM_LABEL_CLASS}
                    >
                      Modalidad
                    </span>
                    <div
                      role="radiogroup"
                      aria-labelledby="application-form-mode"
                      aria-invalid={fieldState.invalid}
                      className="grid grid-cols-3 pl-px"
                    >
                      {modeOptions.map((option) => (
                        <label
                          key={option.value}
                          className="relative -ml-px flex h-11 min-w-0 cursor-pointer items-center justify-center border border-input text-sm font-medium transition-colors hover:bg-muted has-checked:z-10 has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:z-20 has-focus-visible:ring-2 has-focus-visible:ring-ring"
                        >
                          <input
                            type="radio"
                            name={field.name}
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={() => field.onChange(option.value)}
                            onBlur={field.onBlur}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="dateApplied"
                control={form.control}
                render={({ field, fieldState }) => {
                  const selected = field.value
                    ? new Date(field.value)
                    : undefined
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor={field.name}
                        className={FORM_LABEL_CLASS}
                      >
                        Fecha de aplicación
                      </FieldLabel>
                      <Popover
                        open={isDatePickerOpen}
                        onOpenChange={setIsDatePickerOpen}
                      >
                        <PopoverTrigger
                          render={
                            <Button
                              id={field.name}
                              type="button"
                              variant="outline"
                              className={`w-full justify-start gap-2 text-left font-normal ${FORM_CONTROL_CLASS}`}
                            >
                              <CalendarIcon className="size-4" />
                              {formatAppliedDate(selected)}
                            </Button>
                          }
                        />
                        <PopoverContent align="start">
                          <Calendar
                            mode="single"
                            locale={es}
                            selected={selected}
                            onSelect={(date) => {
                              field.onChange(date ? new Date(date) : "")
                              setIsDatePickerOpen(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />
            </section>
          </div>

          <div className="flex flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8">
            <PortalField
              control={form.control}
              current={
                application?.portalId && application.portalName
                  ? { id: application.portalId, name: application.portalName }
                  : undefined
              }
            />

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className={FORM_LABEL_CLASS}
                    >
                      Notas
                    </FieldLabel>
                    <span className={FORM_CAPTION_CLASS}>
                      {notes?.length ?? 0} / {NOTES_MAX_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Contacto, salario, lo que te llamó la atención"
                    className="max-h-48 min-h-24 text-base sm:text-sm md:text-sm"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
          <p className="text-xs text-pretty text-muted-foreground">
            {isEditing
              ? "Estos cambios no agregan eventos al historial."
              : "Si no eliges una fecha, usamos la de hoy."}
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
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Guardar postulación"}
            </Button>
          </div>
        </footer>
      </form>
    </>
  )
}

export default ApplicationForm
