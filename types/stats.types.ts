import { Stage } from "./enums";
import { JobApplication } from "./job-application.types";

export interface DashboardStats {
    totalApplications: number
    byStage: Record<keyof typeof Stage, number>
    recentApplications: JobApplication[],
    antiGhostingRadar: JobApplication[],
}