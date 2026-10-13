"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAppConfiguration } from "@/hooks/use-app-configuration"
import RadarSettingsPanel from "./radar-settings-panel"

const Configuration = () => {
  const {
    config,
    isLoading,
    isSaving,
    isPreviewing,
    pendingConfirmation,
    updateConfig,
    confirmPending,
    cancelPending,
  } = useAppConfiguration()

  const count = pendingConfirmation?.affectedCount ?? 0
  const days = pendingConfirmation?.thresholdDays ?? 0

  return (
    <>
      <RadarSettingsPanel
        thresholdDays={config?.radarGhostingThresholdDays}
        autoIgnoreEnabled={config?.enableRadarAutoIgnore}
        isLoading={isLoading || !config}
        isSaving={isSaving || isPreviewing}
        onThresholdChange={(newDays) => {
          if (newDays === config?.radarGhostingThresholdDays) return
          void updateConfig({ radarGhostingThresholdDays: newDays })
        }}
        onAutoIgnoreChange={(enabled) =>
          void updateConfig({ enableRadarAutoIgnore: enabled })
        }
      />

      <AlertDialog
        open={pendingConfirmation !== null}
        onOpenChange={(open) => {
          if (!open) cancelPending()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {count === 1
                ? "¿Marco 1 postulación como ignorada?"
                : `¿Marco ${count} postulaciones como ignoradas?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {count === 1 ? "Lleva" : "Llevan"} más de {days} días sin noticias
              desde que te postulaste. Si alguna sigue viva, puedes cambiarla
              cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mejor no</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmPending()}>
              {count === 1 ? "Sí, márcala" : "Sí, márcalas"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Configuration
