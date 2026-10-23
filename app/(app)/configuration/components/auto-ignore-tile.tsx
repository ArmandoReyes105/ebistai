import { Skeleton } from "@/components/ui/skeleton"
import { autoIgnoreLabel } from "@/lib/domain/config-settings"
import { cn } from "cn"
import {
  FOCUS_RING,
  LABEL,
  NARROW_TILE,
  TILE_TEXT,
  TILE_TITLE,
} from "./styles"

interface AutoIgnoreTileProps {
  enabled?: boolean
  isLoading: boolean
  onChange: (enabled: boolean) => void
}

const AutoIgnoreTile = ({
  enabled = false,
  isLoading,
  onChange,
}: AutoIgnoreTileProps) => (
  <section aria-labelledby="auto-ignore-heading" className={NARROW_TILE}>
    <div className="flex flex-col gap-2.5">
      <span className={LABEL}>02 · Automático</span>
      <h2 id="auto-ignore-heading" className={TILE_TITLE}>
        Ignorar automáticamente
      </h2>
      <p className={TILE_TEXT}>
        Marca como «Ignorada» las que superen el umbral, sin preguntarte. Si te
        arrepientes, puedes revivirlas.
      </p>
    </div>

    <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
      {isLoading ? (
        <Skeleton aria-hidden="true" className="h-[30px] w-full" />
      ) : (
        <>
          <span className={LABEL}>{autoIgnoreLabel(enabled)}</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-labelledby="auto-ignore-heading"
            onClick={() => onChange(!enabled)}
            className={cn(
              "relative flex h-[30px] w-14 flex-none items-center border p-[3px] transition-colors after:absolute after:-inset-2 pointer-coarse:h-11",
              FOCUS_RING,
              enabled
                ? "border-foreground bg-foreground"
                : "border-ramp-1 bg-muted"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-[22px] transition-transform",
                enabled
                  ? "translate-x-[26px] bg-background"
                  : "bg-muted-foreground"
              )}
            />
          </button>
        </>
      )}
    </div>
  </section>
)

export default AutoIgnoreTile
