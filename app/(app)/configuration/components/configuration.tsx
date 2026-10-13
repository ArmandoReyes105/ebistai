"use client"

import { useAppConfiguration } from "@/hooks/use-app-configuration"
import RadarSettingsPanel from "./radar-settings-panel"

const Configuration = () => {
  const { config, isLoading, isSaving, updateConfig } = useAppConfiguration()

  return (
    <RadarSettingsPanel
      thresholdDays={config?.radarGhostingThresholdDays}
      autoIgnoreEnabled={config?.enableRadarAutoIgnore}
      isLoading={isLoading || !config}
      isSaving={isSaving}
      onThresholdChange={(days) => {
        if (days === config?.radarGhostingThresholdDays) return
        void updateConfig({ radarGhostingThresholdDays: days })
      }}
      onAutoIgnoreChange={(enabled) =>
        void updateConfig({ enableRadarAutoIgnore: enabled })
      }
    />
  )
}

export default Configuration
