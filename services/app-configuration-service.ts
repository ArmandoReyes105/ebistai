import { apiClient, RequestOptions } from "@/lib/api/client";
import {
    AppConfiguration,
    AutoIgnorePreviewResponse,
    UpdateAppConfigurationRequest,
    UpdateAppConfigurationResponse,
} from "@/types/app-configuration.types";

export const appConfigurationService = {
    getConfig: (options?: RequestOptions) => apiClient.get<AppConfiguration>("app-configuration", {
        ...options
    }),

    getAutoIgnorePreview: (thresholdDays: number, options?: RequestOptions) =>
        apiClient.get<AutoIgnorePreviewResponse>("app-configuration/auto-ignore-preview", {
            ...options,
            params: { thresholdDays }
        }),

    patchConfig: (data: UpdateAppConfigurationRequest, options?: RequestOptions) =>
        apiClient.patch<UpdateAppConfigurationResponse | undefined>("app-configuration", data, {
            ...options
        })
}
