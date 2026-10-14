import { ApiError } from "./errors"

const PROBLEM_MESSAGES: Record<string, string> = {
  stage_locked_terminal_status:
    "Esta postulación ya terminó, así que su etapa no se puede cambiar.",
  stage_cannot_return_to_applied:
    "Una postulación no puede volver a la etapa Aplicada.",
  stage_unchanged: "La postulación ya está en esa etapa.",
  offer_is_final_stage:
    "Desde la etapa Oferta ya no se puede cambiar de etapa.",
  offer_status_requires_offer_stage:
    "Solo puedes aceptar o rechazar una oferta cuando la postulación está en etapa Oferta.",
  status_not_active: "Solo puedes cambiar el estado de una postulación activa.",
  use_revive_to_reactivate:
    "Para reactivar una postulación usa la opción Revivir.",
  revive_requires_ignored: "Solo se puede revivir una postulación ignorada.",
  occurred_at_in_future: "La fecha no puede estar en el futuro.",
  occurred_at_out_of_order:
    "La fecha debe quedar entre el evento anterior y el siguiente.",
  cannot_undo_initial_event: "No se puede deshacer el registro inicial.",
  cannot_undo_system_event:
    "Este cambio lo hizo el sistema y no se puede deshacer.",
  invalid_job_posting_url:
    "El enlace de la oferta debe empezar con http:// o https://.",
  date_applied_in_future:
    "La fecha de postulación no puede estar en el futuro.",
  event_not_found: "No encontramos ese evento. Puede que ya se haya deshecho.",
}

export const CONFLICT_MESSAGE = "Algo cambió mientras tanto"

export const isConflictError = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.status === 409 &&
  (error.code === undefined ||
    error.code === "event_not_last" ||
    error.code === "event_sequence_conflict" ||
      error.code === "concurrent_update")

export const isNotFoundError = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 404

// Friendly Spanish message for any error thrown by the API client.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (isConflictError(error)) return CONFLICT_MESSAGE
    if (error.code && PROBLEM_MESSAGES[error.code]) {
      return PROBLEM_MESSAGES[error.code]
    }
  }
  return fallback
}
