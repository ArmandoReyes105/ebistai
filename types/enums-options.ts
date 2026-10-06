import { Stage, Status, WorkMode } from "./enums"

export interface EnumOption<T> {
    value: T
    label: string
}

export const stageOptions: EnumOption<Stage>[] = [
    { value: Stage.Applied, label: "Aplicado" },
    { value: Stage.Interview, label: "Entrevista" },
    { value: Stage.TechnicalInterview, label: "Entrevista Técnica" },
    { value: Stage.Offer, label: "Oferta" }
]

export const statusOptions: EnumOption<Status>[] = [
    { value: Status.Active, label: "Activo" },
    { value: Status.Withdrawn, label: "Retirado" },
    { value: Status.OfferAccepted, label: "Oferta Aceptada" },
    { value: Status.Rejected, label: "Rechazado" },
    { value: Status.Ignored, label: "Ignorado" },
]

export const workModeOptions: EnumOption<WorkMode>[] = [
    { value: WorkMode.Hybrid, label: "Hibrido"},
    { value: WorkMode.OnSite, label: "Presencial" },
    { value: WorkMode.Remote, label: "Remoto" },
]