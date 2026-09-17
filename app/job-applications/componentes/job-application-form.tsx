"use client"

import {
  JobApplicationFormValues,
  jobApplicationSchema,
} from "@/schemas/job-application"
import { zodResolver } from "@hookform/resolvers/zod"
import { WorkMode } from "@/types/enums"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { jobApplicationService } from "@/services/job-application-service"
import { toast } from "@/components/ui/toast"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { workModeOptions } from "@/types/enums-options"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface JobApplicationFormProps {
  onSuccess?: () => void
}

const JobApplicationForm = ({ onSuccess }: JobApplicationFormProps) => {
  const { getToken } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const form = useForm<JobApplicationFormValues>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      jobTitle: "",
      company: "",
      jobPostingUrl: "",
      applicationSource: "",
      mode: undefined,
      dateApplied: "",
      notes: "",
    },
  })

  async function onSubmit(values: JobApplicationFormValues) {
    setIsSubmitting(true)
    try {
      const token = await getToken()

      await jobApplicationService.create(
        {
          jobTitle: values.jobTitle,
          company: values.company,
          jobPostingUrl: values.jobPostingUrl || undefined,
          applicationSource: values.applicationSource,
          mode: Number(values.mode) as WorkMode,
          notes: values.notes || undefined,
          dateApplied: values.dateApplied
            ? new Date(values.dateApplied)
            : new Date(),
        },
        {
          token: token ?? undefined,
        }
      )

      toast.add({
        title: "Solicitud creada exitosamente",
        description: "La solicitud de empleo se agregó correctamente.",
        type: "success",
      })

      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.add({
        title: "Error",
        description: "No se puedo crear la solicitd. Intentelo de nuevo.",
        type: "error",
      })
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            {isSubmitting ? "Guardando..." : "Agregar solicitud"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default JobApplicationForm
