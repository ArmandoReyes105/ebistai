export interface AppConfiguration {
    radarGhostingThresholdDays: number,
    enableRadarAutoIgnore: boolean,
}

export interface UpdateAppConfigurationRequest {
    enableRadarAutoIgnore?: boolean
    radarGhostingThresholdDays?: number
}

export interface AutoIgnorePreviewResponse {
    affectedCount: number
}

// PATCH returns 204 (no body) or 200 with this payload.
export interface UpdateAppConfigurationResponse {
    ignoredCount?: number
}

export interface PendingAutoIgnoreConfirmation {
    changes: UpdateAppConfigurationRequest
    affectedCount: number
    thresholdDays: number
}
