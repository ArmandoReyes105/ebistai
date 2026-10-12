import { apiClient, RequestOptions } from "@/lib/api/client";
import { AppConfiguration, UpdateAppConfigurationRequest } from "@/types/app-configuration.types";

export const appConfigurationService = {
    getConfig: (options?: RequestOptions) => apiClient.get<AppConfiguration>("app-configuration", {
        ...options
    }),

    patchConfig: (data: UpdateAppConfigurationRequest, options?: RequestOptions) => apiClient.patch("app-configuration", data, {
        ...options
    })
}