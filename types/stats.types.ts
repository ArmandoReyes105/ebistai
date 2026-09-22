import { Stage } from "./enums";
import { JobApplication } from "./job-application.types";

export interface DashboardStats {
    totalApplications: number
    byStage: Record<Stage, number>
    recentApplications: JobApplication[],
}