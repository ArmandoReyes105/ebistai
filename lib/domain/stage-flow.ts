import { ApplicationEventField, Stage, Status } from "@/types/enums"
import { ApplicationEvent } from "@/types/job-application.types"

// The default hiring flow. The enum's numeric values are not in this order
// (Assessment = 5 was added last), so never derive it from the enum.
export const STAGE_FLOW: Stage[] = [
  Stage.Applied,
  Stage.Interview,
  Stage.Assessment,
  Stage.TechnicalInterview,
  Stage.Offer,
]

// Stages the application has been moved into, plus Applied (where it starts).
export const getReachedStages = (events: ApplicationEvent[]): Set<Stage> =>
  new Set([
    Stage.Applied,
    ...events
      .filter((event) => event.field === ApplicationEventField.Stage)
      .map((event) => event.toValue as Stage),
  ])

// The middle stages have no fixed order, so the next one is the first stage of
// the default flow not reached yet. Offer closes the flow: nothing follows it.
export const getNextStage = (
  current: Stage,
  reached: Set<Stage>
): Stage | undefined =>
  current === Stage.Offer
    ? undefined
    : STAGE_FLOW.find((stage) => stage !== current && !reached.has(stage))

// Resolves a member of a numeric enum from its NAME. Numeric enums also carry
// reverse keys ("1" -> "Applied") and inherited object keys, so only own keys
// whose value is a number count as names.
const enumFromName = <T extends Record<string, string | number>>(
  enumObject: T,
  name: string,
  label: string
): T[keyof T] => {
  const value = Object.hasOwn(enumObject, name) ? enumObject[name] : undefined
  if (typeof value !== "number") {
    throw new Error(`Unknown ${label} name: "${name}"`)
  }
  return value as T[keyof T]
}

// ONLY for string names coming from /stats/activity (conversion stages and
// "stage" feed events). Radar and recent items from /stats carry `stage` as a
// NUMBER already: use stageBadgeConfig[application.stage] there. Throws on an
// unknown name.
export const stageFromName = (name: string): Stage =>
  enumFromName(Stage, name, "stage")

// Status counterpart for the "revive" and "closed" feed kinds, whose from/to
// are STATUS names (not stages). Throws on an unknown name.
export const statusFromName = (name: string): Status =>
  enumFromName(Status, name, "status")
