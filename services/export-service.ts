import { apiClient, RequestOptions } from "@/lib/api/client";

export const exportService = {
    // The .xlsx with every application and its history; `tz` is the browser's
    // IANA zone so the API writes dates in local time (UTC when unknown).
    downloadApplications: (timeZone: string, options?: RequestOptions) =>
        apiClient.getBlob("export/applications", {
            ...options,
            params: { tz: timeZone },
        }),
}
