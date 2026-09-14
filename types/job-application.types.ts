import { Stage, Status, WorkMode } from "./enums";

export interface JobApplication {
    id: string;
    jobTitle: string;
    company: string;
    jobPostingUrl?: string;
    applicationSource: string;
    status: Status;
    stage: Stage;
    mode: WorkMode;
    notes: string;
    dateApplied: Date;
}

export interface CreateJobApplicationRequest {
    jobTitle: string;
    company: string,
    jobPostingUrl?: string;
    applicationSource: string;
    mode: WorkMode;
    notes?: string;
    dateApplied?: Date;
}

export interface UpdateJobApplicationRequest {
    jobTitle: string;
    company: string;
    jobPostingUrl?: string;
    applicationSource: string;
    mode: WorkMode;
    status: Status;
    stage: Stage;
    notes?: string;
    dateApplied?: Date;
}

export interface UpdateStageRequest {
    stage: Stage;
}

export interface UpdateStatusRequest {
    status: Status;
}