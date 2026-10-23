// Shared class strings for the configuration page (semantic tokens only).

export { FOCUS_RING, LABEL } from "@/app/(app)/dashboard/components/styles"

// A bento tile; the narrow ones wrap from a ~280px basis.
export const TILE =
  "flex min-w-0 flex-col gap-5 border border-border bg-card p-7"
export const NARROW_TILE = `${TILE} basis-70 grow justify-between`

export const TILE_TITLE = "text-xl font-semibold"
export const TILE_TEXT = "text-sm/normal text-muted-foreground"

// 36px with a fine pointer, 44px on touch.
export const BUTTON_SIZE = "h-9 pointer-coarse:h-11"
