/** Timing and easing helpers for the pose morph. All pure. */
export type Easing = (t: number) => number

export type MorphDirection = "sleep" | "wake"

/** Default morph duration, in milliseconds. */
export const DEFAULT_MORPH_MS = 1100

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

export const smoothstep: Easing = (t) => t * t * (3 - 2 * t)

/** Default morph easing. */
export const easeInOutCubic: Easing = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/** Looping CSS animations fade out at the start and back in at the end, swapped at t = 0.5. */
export function loopAmplitude(t: number, startAmp: number): number {
  if (t < 0.5) return startAmp * (1 - smoothstep(clamp01(t / 0.15)))
  return smoothstep(clamp01((t - 0.85) / 0.15))
}

/** Glyph opacity (z's, snowflakes): late fade-in on "sleep", early fade-out on "wake". */
export function zOpacity(
  direction: MorphDirection,
  t: number,
  from: number
): number {
  if (direction === "sleep") {
    return from + (1 - from) * smoothstep(clamp01((t - 0.72) / 0.28))
  }
  return from * (1 - smoothstep(clamp01(t / 0.25)))
}
