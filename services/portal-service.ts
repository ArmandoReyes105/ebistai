import { apiClient, RequestOptions } from "@/lib/api/client"
import { Portal, SavePortalRequest } from "@/types/portal.types"

const BASE = "portals"

export const portalService = {
  getAll: (options?: RequestOptions) =>
    apiClient.get<Portal[]>(BASE, { ...options }),

  create: (data: SavePortalRequest, options?: RequestOptions) =>
    apiClient.post<Portal>(BASE, data, { ...options }),

  update: (id: string, data: SavePortalRequest, options?: RequestOptions) =>
    apiClient.put<Portal>(`${BASE}/${id}`, data, { ...options }),

  delete: (id: string, options?: RequestOptions) =>
    apiClient.delete<void>(`${BASE}/${id}`, { ...options }),
}
