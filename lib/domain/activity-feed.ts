import {
  stageBadgeConfig,
  statusBadgeConfig,
} from "@/lib/components/badge-config"
import { Status } from "@/types/enums"
import type { ActivityEvent } from "@/types/stats.types"
import { stageFromName, statusFromName } from "./stage-flow"

export type FeedMarker = "new" | "advance" | "closed"

export interface FeedDescription {
  // What happened, without the company (the row shows it separately).
  text: string
  marker: FeedMarker
  // True for events written by the System actor (e.g. auto-ignore).
  automatic: boolean
}

// The activity API sends enum NAMES as strings. A name this build does not
// know must not take the whole feed down, so it falls back to the raw name.
const stageLabel = (name: string): string => {
  try {
    return stageBadgeConfig[stageFromName(name)].label
  } catch {
    return name
  }
}

const statusLabel = (name: string): string => {
  try {
    return statusBadgeConfig[statusFromName(name)].label
  } catch {
    return name
  }
}

const isIgnored = (name: string): boolean => {
  try {
    return statusFromName(name) === Status.Ignored
  } catch {
    return false
  }
}

// Per-kind wording (JD3-2): "stage" from/to are STAGE names; "revive" and
// "closed" from/to are STATUS names.
export const describeActivityEvent = (
  event: ActivityEvent
): FeedDescription => {
  const automatic = event.actor === "System"

  switch (event.kind) {
    case "new":
      return {
        text: `aplicaste a ${event.jobTitle}`,
        marker: "new",
        automatic,
      }
    case "stage":
      return {
        text: event.from
          ? `pasó de ${stageLabel(event.from)} a ${stageLabel(event.to)}`
          : `pasó a ${stageLabel(event.to)}`,
        marker: "advance",
        automatic,
      }
    case "revive":
      return {
        text: event.from
          ? `volvió a estar activa (antes: ${statusLabel(event.from)})`
          : "volvió a estar activa",
        marker: "advance",
        automatic,
      }
    case "closed":
      return {
        text:
          automatic && isIgnored(event.to)
            ? "Ignorada automáticamente"
            : `cerró el proceso: ${statusLabel(event.to)}`,
        marker: "closed",
        automatic,
      }
  }
}
