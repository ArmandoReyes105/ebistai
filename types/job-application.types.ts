import { Actor, ApplicationEventField, Stage, Status, WorkMode } from "./enums";

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
    lastProgressAt?: Date;
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

// Stage and status are changed through their own endpoints, not via PUT.
export interface UpdateJobApplicationRequest {
    jobTitle: string;
    company: string;
    jobPostingUrl?: string;
    applicationSource: string;
    mode: WorkMode;
    notes?: string;
    dateApplied?: Date;
}

// `occurredAt` is optional: the server uses "now" when omitted.
export interface ChangeStageRequest {
    stage: Stage;
    occurredAt?: Date | string;
}

export interface ChangeStatusRequest {
    status: Status;
    occurredAt?: Date | string;
}

export interface ReviveRequest {
    occurredAt?: Date | string;
}

export interface UpdateEventDateRequest {
    occurredAt: Date | string;
}

export interface ApplicationActionResponse {
    application: JobApplication;
    eventId: string;
}

export interface ApplicationEvent {
    id: string;
    sequence: number;
    field: ApplicationEventField;
    // Null on the initial event. Holds a Stage or Status value depending on `field`.
    fromValue: number | null;
    toValue: number;
    occurredAt: string;
    recordedAt: string;
    actor: Actor;
    canUndo: boolean;
}

export interface PagedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    // 0 when there are no results.
    totalPages: number;
}

export interface JobApplicationSource {
    id: number;
    name: string;
}
