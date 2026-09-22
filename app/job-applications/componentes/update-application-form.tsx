"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  UpdateapplicationFormValues,
  updateApplicationSchema,
} from "@/schemas/job-application"
import { jobApplicationService } from "@/services/job-application-service"
import { WorkMode } from "@/types/enums"
import {
  stageOptions,
  statusOptions,
  workModeOptions,
} from "@/types/enums-options"
import { JobApplication } from "@/types/job-application.types"
import { useAuth } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

interface UpdateApplicationFormProps {
  application: JobApplication
  onSuccess: () => void
}

const UpdateApplicationForm = ({
  application,
  onSuccess,
}: UpdateApplicationFormProps) => {
  const { getToken } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  async function onSubmit(values: UpdateapplicationFormValues) {
    setIsSubmitting(true)
    try {
      const token = await getToken()

      await jobApplicationService.update(
        application.id,
        {
          jobTitle: values.jobTitle,
          company: values.company,
          jobPostingUrl: values.jobPostingUrl || undefined,
          applicationSource: values.applicationSource,
          mode: Number(values.mode) as WorkMode,
          notes: values.notes || undefined,
          stage: values.stage,
          status: values.status,
          dateApplied: values.dateApplied
            ? new Date(values.dateApplied)
            : new Date(),
        },
        {
          token: token ?? undefined,
        }
      )

      toast.add({
        title: "Solicitud actualizada exitosamente",
        description: "La solicitud de empleo se actualizó correctamente.",
        type: "success",
      })

      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.add({
        title: "Error",
        description: "No se puedo actualizar la solicitd. Intentelo de nuevo.",
        type: "error",
      })
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const form = useForm<UpdateapplicationFormValues>({
    resolver: zodResolver(updateApplicationSchema),
    defaultValues: {
      jobTitle: application.jobTitle,
      company: application.company,
      jobPostingUrl: application.jobPostingUrl
        ? application.jobPostingUrl
        : undefined,
      applicationSource: application.applicationSource,
      mode: application.mode,
      stage: application.stage,
      status: application.status,
      dateApplied: application.dateApplied
        ? new Date(application.dateApplied)
        : new Date(),
      notes: application.notes ?? "",
    },
  })

  return (
    <form id="form-job-application" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="jobTitle"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Puesto</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Ej. Frontend Developer"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="company"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Compañía</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Ej. Acme Corp"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="jobPostingUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Enlace de la oferta</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="https://..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="applicationSource"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Fuente de aplicación</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Ej. LinkedIn, referido..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="mode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="responsive" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="job-application-mode">
                  Modalidad
                </FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select
                items={workModeOptions}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="job-application-mode"
                  aria-invalid={fieldState.invalid}
                  className="min-w-40"
                >
                  <SelectValue placeholder="Selecciona una modalidad" />
                </SelectTrigger>
                <SelectContent>
                  {workModeOptions.map((item) => (
                    <SelectItem key={item.label} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="stage"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="responsive" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="job-application-stage">Etapa</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select
                items={stageOptions}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="job-application-mode"
                  aria-invalid={fieldState.invalid}
                  className="min-w-40"
                >
                  <SelectValue placeholder="Selecciona una modalidad" />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((item) => (
                    <SelectItem key={item.label} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="responsive" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="job-application-mode">Estado</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select
                items={statusOptions}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="job-application-mode"
                  aria-invalid={fieldState.invalid}
                  className="min-w-40"
                >
                  <SelectValue placeholder="Selecciona una modalidad" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((item) => (
                    <SelectItem key={item.label} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="dateApplied"
          control={form.control}
          render={({ field, fieldState }) => {
            const selectDate = field.value ? new Date(field.value) : undefined
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Fecha de aplicación
                </FieldLabel>

                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        data-empty={!selectDate}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon />
                        {selectDate ? (
                          format(selectDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    }
                  />
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={selectDate}
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

        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Notas</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Opcional"
                className="min-h-25"
              />
              <FieldDescription>
                Cualquier detalle adicional sobre la solicitud.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Actualizar solicitud"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default UpdateApplicationForm
