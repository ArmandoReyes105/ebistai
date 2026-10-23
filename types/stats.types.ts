import { Stage } from "./enums";
import { JobApplication } from "./job-application.types";

export interface DashboardStats {
    totalApplications: number
    byStage: Record<keyof typeof Stage, number>
    recentApplications: JobApplication[],
    antiGhostingRadar: JobApplication[],
    radarGhostingThresholdDays: number,
    activeCount: number,
}

// GET /stats/activity. Every instant is a UTC ISO-8601 string; kinds, stage
// names and actors are plain strings (the API has no enum converter).
export type MovementKind = "new" | "advance"

export interface ActivityMovement {
    occurredAt: string
    kind: MovementKind
}

export interface StageConversion {
    // Stage enum NAME (e.g. "TechnicalInterview"), never the numeric value.
    stage: string
    count: number
    pct: number
}

export type ActivityEventKind = "new" | "stage" | "revive" | "closed"

export type ActivityActor = "User" | "System" | "Ai"

export interface ActivityEvent {
    applicationId: string
    company: string
    jobTitle: string
    kind: ActivityEventKind
    // Stage names for "stage", status names for "revive" and "closed"; null for "new".
    from: string | null
    to: string
    occurredAt: string
    actor: ActivityActor
}

export interface ActivityStats {
    movements: ActivityMovement[]
    medianDaysToFirstResponse: number | null
    responseRate: number | null
    respondedCount: number
    applicationsCount: number
    conversion: StageConversion[]
    recentEvents: ActivityEvent[]
}
