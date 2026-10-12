export interface AppConfiguration {
    radarGhostingThresholdDays: number,
    enableRadarAutoIgnore: boolean,
}

export interface UpdateAppConfigurationRequest {
    enableRadarAutoIgnore?: boolean
    radarGhostingThresholdDays?: number
}