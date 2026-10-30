import type { PoseId } from "@/lib/tai/types"

export type ApplicationTaiPose = Extract<PoseId, "neutral" | "sleep" | "cold">

interface TaiPoseInput {
  // The process is over (not Active): nothing left to chase.
  closed: boolean
  // Whole days since the last progress (or since it closed, when closed).
  days: number
  // Radar threshold in days: from here on the application is cooling.
  threshold: number
}

// Tai's pose for one application: closed -> asleep, cooling -> cold,
// otherwise neutral.
export function taiPoseFor({
  closed,
  days,
  threshold,
}: TaiPoseInput): ApplicationTaiPose {
  if (closed) return "sleep"
  return days >= threshold ? "cold" : "neutral"
}
