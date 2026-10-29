"use client"

import { Button } from "@/components/ui/button"
import { useApplicationsExport } from "@/hooks/use-applications-export"
import { cn } from "cn"
import {
  BUTTON_SIZE,
  LABEL,
  NARROW_TILE,
  TILE_TEXT,
  TILE_TITLE,
} from "./styles"

const DataTile = () => {
  const { isExporting, exportApplications } = useApplicationsExport()

  return (
    <section aria-labelledby="data-heading" className={NARROW_TILE}>
      <div className="flex flex-col gap-2.5">
        <span className={LABEL}>05 · Tus datos</span>
        <h2 id="data-heading" className={TILE_TITLE}>
          Exporta tus aplicaciones
        </h2>
        <p className={TILE_TEXT}>
          Descarga un Excel con todas tus aplicaciones y su historial. Tus datos
          son tuyos: puedes llevártelos cuando quieras.
        </p>
      </div>

      <div className="flex border-t border-border pt-4">
        <Button
          variant="outline"
          onClick={() => void exportApplications()}
          disabled={isExporting}
          aria-busy={isExporting}
          className={cn(
            "flex-auto border-foreground px-4 text-sm",
            BUTTON_SIZE
          )}
        >
          {isExporting ? "Preparando tu Excel…" : "Exportar a Excel"}
        </Button>
      </div>
    </section>
  )
}

export default DataTile
