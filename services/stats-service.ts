import { apiClient, RequestOptions } from "@/lib/api/client";
import { DashboardStats } from "@/types/stats.types";

export const statsService = {
    getDashboardStats: (options?: RequestOptions) =>
        apiClient.get<DashboardStats>("stats", {...options})
}