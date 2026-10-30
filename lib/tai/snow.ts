/** Positions are in the shared frame (see TAI_VIEW_BOX), around Tai's head. */
export interface Snowflake {
  x: number
  y: number
  /** Arm length. */
  r: number
  /** Animation delay, seconds. */
  delay: number
}

export const SNOWFLAKES: readonly Snowflake[] = [
  { x: 12, y: 12, r: 9, delay: 0 },
  { x: 38, y: -2, r: 6, delay: 1.5 },
  { x: 150, y: 6, r: 7.5, delay: 3 },
]

/** Fall path in user units, relative to a flake's position. */
export const SNOW_DRIFT = { startX: -3, startY: -6, endX: 5, endY: 12 } as const

/** Room for the spin and stroke width. */
export const SNOW_MARGIN = 1.5

/** Six strokes from the center, each with a pair of small branches. */
export function snowflakePath(r: number): string {
  const f = (v: number) => String(Math.round(v * 100) / 100)
  const branch = r * 0.55
  const spread = r * 0.3
  let d = ""
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 2
    const [cos, sin] = [Math.cos(a), Math.sin(a)]
    const tip = [r * cos, r * sin]
    d += `M0 0L${f(tip[0])} ${f(tip[1])}`
    // Branches leave the arm at 55% of its length and sweep outward.
    const bx = branch * cos
    const by = branch * sin
    for (const side of [-1, 1]) {
      const wx = bx + side * spread * -sin * 1 + spread * 0.6 * cos
      const wy = by + side * spread * cos + spread * 0.6 * sin
      d += `M${f(bx)} ${f(by)}L${f(wx)} ${f(wy)}`
    }
  }
  return d
}
