import { apiClient, RequestOptions } from "@/lib/api/client"
import {
  ApplicationActionResponse,
  ApplicationEvent,
  ChangeStageRequest,
  ChangeStatusRequest,
  CreateJobApplicationRequest,
  JobApplication,
  ReviveRequest,
  UpdateEventDateRequest,
  UpdateJobApplicationRequest,
} from "@/types/job-application.types"

const BASE = "job-applications"

export const jobApplicationService = {
  getAll: (options?: RequestOptions) =>
    apiClient.get<JobApplication[]>(BASE, { ...options }),

  getById: (id: string, options?: RequestOptions) =>
    apiClient.get<JobApplication>(`${BASE}/${id}`, { ...options }),

  create: (data: CreateJobApplicationRequest, options?: RequestOptions) =>
    apiClient.post<JobApplication>(BASE, data, { ...options }),

  update: (
    id: string,
    data: UpdateJobApplicationRequest,
    options?: RequestOptions
  ) => apiClient.put<JobApplication>(`${BASE}/${id}`, data, { ...options }),

  delete: (id: string, options?: RequestOptions) =>
    apiClient.delete<void>(`${BASE}/${id}`, { ...options }),

  changeStage: (
    id: string,
    data: ChangeStageRequest,
    options?: RequestOptions
  ) =>
    apiClient.post<ApplicationActionResponse>(`${BASE}/${id}/stage`, data, {
      ...options,
    }),

  changeStatus: (
    id: string,
    data: ChangeStatusRequest,
    options?: RequestOptions
  ) =>
    apiClient.post<ApplicationActionResponse>(`${BASE}/${id}/status`, data, {
      ...options,
    }),

  revive: (id: string, data: ReviveRequest = {}, options?: RequestOptions) =>
    apiClient.post<ApplicationActionResponse>(`${BASE}/${id}/revive`, data, {
      ...options,
    }),

  getEvents: (id: string, options?: RequestOptions) =>
    apiClient.get<ApplicationEvent[]>(`${BASE}/${id}/events`, { ...options }),

  updateEventDate: (
    id: string,
    eventId: string,
    data: UpdateEventDateRequest,
    options?: RequestOptions
  ) =>
    apiClient.patch<ApplicationActionResponse>(
      `${BASE}/${id}/events/${eventId}`,
      data,
      { ...options }
    ),

  undoEvent: (id: string, eventId: string, options?: RequestOptions) =>
    apiClient.delete<ApplicationActionResponse>(
      `${BASE}/${id}/events/${eventId}`,
      { ...options }
    ),
}
