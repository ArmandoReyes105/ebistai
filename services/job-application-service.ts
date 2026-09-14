import { apiClient, RequestOptions } from "@/lib/api/client"
import {
  CreateJobApplicationRequest,
  JobApplication,
  UpdateJobApplicationRequest,
  UpdateStageRequest,
  UpdateStatusRequest,
} from "@/types/job-application.types"

export const jobApplicationService = {
  getAll: (options?: RequestOptions) =>
    apiClient.get<JobApplication[]>("job-applications", { ...options }),

  create: (data: CreateJobApplicationRequest, options?: RequestOptions) =>
    apiClient.post<JobApplication>("job-applications", data, { ...options }),

  updateStage: (
    id: string,
    data: UpdateStageRequest,
    options?: RequestOptions
  ) =>
    apiClient.patch<JobApplication>(`job-applications/${id}/stage`, data, {
      ...options,
    }),

  updateStatus: (
    id: string,
    data: UpdateStatusRequest,
    options?: RequestOptions
  ) =>
    apiClient.patch<JobApplication>(`job-applications/${id}/status`, data, {
      ...options,
    }),

  delete: (id: string, options?: RequestOptions) =>
    apiClient.delete<void>(`job-applications/${id}`, { ...options }),

  update: (
    id: string,
    data: UpdateJobApplicationRequest,
    options?: RequestOptions
  ) =>
    apiClient.put<JobApplication>(`job-applications/${id}`, data, {
      ...options,
    }),
}
