import { Actor, ApplicationEventField, Stage, Status } from "@/types/enums"
import { stageOptions, statusOptions } from "@/types/enums-options"
import { ApplicationEvent, JobApplication } from "@/types/job-application.types"

// The backend is the authority; these helpers only keep the UI from
// offering actions that would be rejected.

type StateOf = Pick<JobApplication, "stage" | "status">

export const stageLabels: Record<Stage, string> = Object.fromEntries(
  stageOptions.map((o) => [o.value, o.label])
) as Record<Stage, string>

export const statusLabels: Record<Status, string> = Object.fromEntries(
  statusOptions.map((o) => [o.value, o.label])
) as Record<Status, string>

export const actorLabels: Record<Actor, string> = {
  [Actor.User]: "Tú",
  [Actor.System]: "Sistema",
  [Actor.Ai]: "IA",
}

export const isTerminal = (app: StateOf): boolean =>
  app.status !== Status.Active

export const canRevive = (app: StateOf): boolean =>
  app.status === Status.Ignored

// Valid stage targets, already in display order.
export function getStageTargets(app: StateOf): Stage[] {
  if (isTerminal(app) || app.stage === Stage.Offer) return []
  return stageOptions
    .map((o) => o.value)
    .filter((s) => s !== Stage.Applied && s !== app.stage)
}

// Valid status targets (never Active: that is what Revive is for).
export function getStatusTargets(app: StateOf): Status[] {
  if (isTerminal(app)) return []
  const targets = [
    Status.Rejected,
    Status.Withdrawn,
    Status.PositionClosed,
    Status.Ignored,
  ]
  if (app.stage === Stage.Offer) {
    targets.push(Status.OfferAccepted, Status.OfferDeclined)
  }
  return statusOptions.map((o) => o.value).filter((s) => targets.includes(s))
}

// "Rechazada en Entrevista técnica"; offer outcomes read on their own.
export function getCombinedLabel(app: StateOf): string {
  if (app.status === Status.Active) return stageLabels[app.stage]
  if (app.status === Status.OfferAccepted || app.status === Status.OfferDeclined) {
    return statusLabels[app.status]
  }
  return `${statusLabels[app.status]} en ${stageLabels[app.stage]}`
}

export const describeStageChange = (stage: Stage): string =>
  `Movida a ${stageLabels[stage]}`

export function describeStatusChange(status: Status): string {
  switch (status) {
    case Status.Active:
      return "Revivida"
    case Status.OfferAccepted:
      return "Oferta aceptada"
    case Status.OfferDeclined:
      return "Oferta rechazada"
    default:
      return `Marcada como ${statusLabels[status]}`
  }
}

// Timeline sentence for an event.
export function describeEvent(event: ApplicationEvent): string {
  if (event.field === ApplicationEventField.Stage) {
    if (event.fromValue === null) return "Te postulaste"
    return `Pasó a ${stageLabels[event.toValue as Stage] ?? "otra etapa"}`
  }
  return describeStatusChange(event.toValue as Status)
}
