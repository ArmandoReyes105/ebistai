import { Stage, Status, WorkMode } from "./enums"

export interface EnumOption<T> {
    value: T
    label: string
}

// Display order of stages (not the numeric enum order).
export const stageOptions: EnumOption<Stage>[] = [
    { value: Stage.Applied, label: "Aplicada" },
    { value: Stage.Interview, label: "Entrevista" },
    { value: Stage.Assessment, label: "Prueba técnica" },
    { value: Stage.TechnicalInterview, label: "Entrevista técnica" },
    { value: Stage.Offer, label: "Oferta" }
]

export const statusOptions: EnumOption<Status>[] = [
    { value: Status.Active, label: "Activa" },
    { value: Status.Rejected, label: "Rechazada" },
    { value: Status.Withdrawn, label: "Retirada" },
    { value: Status.OfferAccepted, label: "Oferta aceptada" },
    { value: Status.Ignored, label: "Ignorada" },
    { value: Status.OfferDeclined, label: "Oferta rechazada" },
    { value: Status.PositionClosed, label: "Vacante cerrada" },
]

export const workModeOptions: EnumOption<WorkMode>[] = [
    { value: WorkMode.Hybrid, label: "Hibrido"},
    { value: WorkMode.OnSite, label: "Presencial" },
    { value: WorkMode.Remote, label: "Remoto" },
]
