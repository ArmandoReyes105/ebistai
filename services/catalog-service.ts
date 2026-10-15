import { apiClient, RequestOptions } from "@/lib/api/client"

const BASE = "catalog"

export const catalogService = {
  getCompanies: (q: string, options?: RequestOptions) =>
    apiClient.get<string[]>(`${BASE}/companies`, { params: { q }, ...options }),

  getSources: (q: string, options?: RequestOptions) =>
    apiClient.get<string[]>(`${BASE}/sources`, { params: { q }, ...options }),
}
