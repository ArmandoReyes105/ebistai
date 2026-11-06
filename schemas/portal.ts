import z from "zod"

export const PORTAL_NOTES_MAX_LENGTH = 4000

export const portalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe el nombre del portal")
    .max(200, "El nombre del portal es demasiado largo"),
  url: z
    .url({
      protocol: /^https?$/,
      error: "Ingresa una URL válida (http o https)",
    })
    .max(500, "La URL es demasiado larga"),
  notes: z
    .string()
    .max(PORTAL_NOTES_MAX_LENGTH, `Máximo ${PORTAL_NOTES_MAX_LENGTH} caracteres`)
    .optional()
    .or(z.literal("")),
})

export type PortalFormValues = z.infer<typeof portalSchema>
