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
import { useRadarCount } from "@/hooks/use-radar-count"
import { useEffect, useRef } from "react"
import AccountTile from "./account-tile"
import AutoIgnoreTile from "./auto-ignore-tile"
import DataTile from "./data-tile"
import RadarTile from "./radar-tile"
import ThemeTile from "./theme-tile"

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

  const { state: radarCount, refresh: refreshRadarCount } = useRadarCount()

  // "Hoy: N" must reflect the SAVED threshold (and any auto-ignore the save
  // triggered): refetch when a save settles, successful or not.
  const wasSavingRef = useRef(false)
  useEffect(() => {
    if (wasSavingRef.current && !isSaving) void refreshRadarCount()
    wasSavingRef.current = isSaving
  }, [isSaving, refreshRadarCount])

  const isConfigLoading = isLoading || !config
  const count = pendingConfirmation?.affectedCount ?? 0
  const days = pendingConfirmation?.thresholdDays ?? 0

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <RadarTile
          thresholdDays={config?.radarGhostingThresholdDays}
          isLoading={isConfigLoading}
          count={radarCount}
          onThresholdChange={(newDays) => {
            if (isSaving || isPreviewing) return
            if (newDays === config?.radarGhostingThresholdDays) return
            void updateConfig({ radarGhostingThresholdDays: newDays })
          }}
        />
        <AutoIgnoreTile
          enabled={config?.enableRadarAutoIgnore}
          isLoading={isConfigLoading}
          onChange={(enabled) => {
            if (isSaving || isPreviewing) return
            void updateConfig({ enableRadarAutoIgnore: enabled })
          }}
        />
        <ThemeTile />
        <AccountTile />
        <DataTile />
      </div>

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
