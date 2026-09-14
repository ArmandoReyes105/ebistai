import { Stage, Status, WorkMode } from "@/types/enums"

export type BadgeConfig = {
  label: string
  className: string
}

export const statusBadgeConfig: Record<Status, BadgeConfig> = {
  [Status.Active]: {
    label: "Activa",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  },

  [Status.Rejected]: {
    label: "Rechazada",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },

  [Status.Withdrawn]: {
    label: "Retirada",
    className:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-300",
  },

  [Status.OfferAccepted]: {
    label: "Aceptada",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
}

export const stageBadgeConfig: Record<Stage, BadgeConfig> = {
  [Stage.Applied]: {
    label: "Postulación",
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  },

  [Stage.Interview]: {
    label: "Entrevista",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },

  [Stage.TechnicalInterview]: {
    label: "Prueba Técnica",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
  },

  [Stage.Offer]: {
    label: "Oferta",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
}

export const modalityBadgeConfig: Record<WorkMode, BadgeConfig> = {
  [WorkMode.Remote]: {
    label: "Remoto",
    className:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
  },

  [WorkMode.OnSite]: {
    label: "Presencial",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-300",
  },

  [WorkMode.Hybrid]: {
    label: "Híbrido",
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
}
