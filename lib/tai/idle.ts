import type { PoseId } from "./types"

export type Random = () => number
export type IdleKind = "neutral" | "sleep" | "cold" | "none"

export const BLINK_MS = 150
export const DOUBLE_BLINK_GAP_MS = 130

const between = (rand: Random, min: number, max: number) =>
  min + rand() * (max - min)

export interface BlinkPlan {
  delayMs: number
  double: boolean
}

/** Next blink: 3 to 6 s away, one time in four a double blink. */
export function nextBlink(rand: Random = Math.random): BlinkPlan {
  const delayMs = between(rand, 3000, 6000)
  return { delayMs, double: rand() < 0.25 }
}

export interface ShiverPlan {
  delayMs: number
  durationMs: number
}

/** Next shiver burst: 2.5 to 5 s away, 300 to 450 ms long. */
export function nextShiver(rand: Random = Math.random): ShiverPlan {
  return {
    delayMs: between(rand, 2500, 5000),
    durationMs: between(rand, 300, 450),
  }
}

export interface ShiverFrame {
  x: number
  rotate: number
}

/** Fast alternating horizontal jitter that decays back to rest. */
export function shiverFrames(amplitude: number): ShiverFrame[] {
  const strengths = [1, 0.85, 0.9, 0.7, 0.55, 0.35]
  const frames: ShiverFrame[] = [{ x: 0, rotate: 0 }]
  strengths.forEach((s, i) => {
    const sign = i % 2 === 0 ? 1 : -1
    frames.push({ x: sign * s * amplitude, rotate: sign * s * amplitude * 0.3 })
  })
  frames.push({ x: 0, rotate: 0 })
  return frames
}

export function idleKindFor(pose: PoseId): IdleKind {
  return pose === "sad" ? "none" : pose
}
