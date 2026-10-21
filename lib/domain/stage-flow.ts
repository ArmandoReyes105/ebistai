import { ApplicationEventField, Stage } from "@/types/enums"
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
