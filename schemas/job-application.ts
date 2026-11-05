import { WorkMode } from "@/types/enums";
import z from "zod";

export const jobApplicationSchema = z.object({
    jobTitle: z
      .string()
      .min(2, "El puesto debe tener al menos 2 caracteres")
      .max(200, "El nombre del puesto es demasiado largo"),
    company: z
      .string()
      .min(2, "La compañia debe tener al menos 2 caracteres")
      .max(200, "El nombre de la compañia es demasiado largo"),
    jobPostingUrl: z
      .url({
        protocol: /^https?$/,
        error: "Ingrese una URL válida (http o https)",
      })
      .max(500, "La URL es demasiado larga")
      .optional()
      .or(z.literal("")),
    applicationSource: z
      .string()
      .min(2, "Indica la fuente de la aplicación")
      .max(150, "El nombre de la fuente es demasiado largo"),
    mode: z
      .enum(WorkMode, "Selecciona una modalidad"),
    dateApplied: z
      .date()
      .optional()
      .or(z.literal("")),
    notes: z
      .string()
      .max(4000, "Máximo 4000 caracteres")
      .optional()
      .or(z.literal("")),
});

// Stage and status are no longer editable here; they have their own actions.
export const updateApplicationSchema = jobApplicationSchema

export type JobApplicationFormValues = z.infer<typeof jobApplicationSchema>

export type UpdateapplicationFormValues = z.infer<typeof updateApplicationSchema>