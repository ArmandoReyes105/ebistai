import { apiClient, RequestOptions } from "@/lib/api/client";
import { ActivityStats, DashboardStats } from "@/types/stats.types";

export const statsService = {
    getDashboardStats: (options?: RequestOptions) =>
        apiClient.get<DashboardStats>("stats", {...options}),

    // No query parameters: the API returns UTC instants and the browser
    // groups them by local day.
    getActivity: (options?: RequestOptions) =>
        apiClient.get<ActivityStats>("stats/activity", {...options})
}