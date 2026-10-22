// Shared class strings for the dashboard (semantic tokens only).

export const LABEL =
  "font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase"

export const SECTION_TITLE = "text-xl font-semibold"

export const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

// The tile grid: one column on phones, two from sm, four from xl.
export const TILES_GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"

// Grid cells stretch their single child (tile, skeleton or error) to the
// cell height.
const CELL = "flex min-w-0 flex-col *:flex-1"
export const RADAR_CELL = `${CELL} sm:col-span-2 xl:row-span-2`
export const RESPONSE_CELL = `${CELL} sm:col-span-2 xl:col-span-1 xl:row-span-2`
export const METRIC_CELL = CELL
