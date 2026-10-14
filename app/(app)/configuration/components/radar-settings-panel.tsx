import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { cn } from "cn"
import { Radar } from "lucide-react"

export const THRESHOLD_OPTIONS = [14, 21, 25, 30, 45] as const

interface RadarSettingsPanelProps {
  thresholdDays?: number
  autoIgnoreEnabled?: boolean
  isLoading?: boolean
  isSaving?: boolean
  // Omit the handlers to render the controls read-only.
  onThresholdChange?: (days: number) => void
  onAutoIgnoreChange?: (enabled: boolean) => void
}

const RadarSettingsPanel = ({
  thresholdDays,
  autoIgnoreEnabled = false,
  isLoading = false,
  isSaving = false,
  onThresholdChange,
  onAutoIgnoreChange,
}: RadarSettingsPanelProps) => {
  const isReadOnly = !onThresholdChange

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center gap-4">
          <div className="bg-amber-400/20 p-2">
            <Radar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle>Radar anti-ghosting</CardTitle>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span id="radar-threshold-label" className="text-sm font-semibold">
            Días sin noticias para sugerir «Ignorada»
          </span>
          <p className="text-xs/relaxed text-muted-foreground">
            El radar vigila tus postulaciones activas en cualquier etapa, menos
            Oferta, y cuenta los días desde tu último avance (el último cambio
            de etapa), no desde que te postulaste. Nunca cambia el estado sin
            tu confirmación.
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-10 w-80 max-w-full" />
        ) : (
          <div
            role="radiogroup"
            aria-labelledby="radar-threshold-label"
            className="flex w-fit max-w-full flex-wrap gap-1 border p-1"
          >
            {THRESHOLD_OPTIONS.map((days) => {
              const isSelected = days === thresholdDays

              return (
                <button
                  key={days}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={(isReadOnly && !isSelected) || isSaving}
                  onClick={() => onThresholdChange?.(days)}
                  className={cn(
                    "px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                    isSelected && "bg-muted font-semibold text-foreground",
                    !isReadOnly && !isSelected && "hover:text-foreground",
                    isReadOnly && "cursor-default"
                  )}
                >
                  {days} días
                </button>
              )
            })}
          </div>
        )}

        <Separator className="my-1" />

        <div className="flex flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span id="radar-auto-ignore-label" className="text-sm font-semibold">
              Ignorar automáticamente
            </span>
            <p className="text-xs/relaxed text-muted-foreground">
              Marca como «Ignorada» las postulaciones que superen el umbral, sin
              pedirte confirmación. Si te arrepientes, puedes revivirlas.
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-9 shrink-0" />
          ) : (
            <Switch
              aria-labelledby="radar-auto-ignore-label"
              checked={autoIgnoreEnabled}
              onCheckedChange={(checked) => onAutoIgnoreChange?.(checked)}
              disabled={!onAutoIgnoreChange || isSaving}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RadarSettingsPanel
