"use client"

import {
  stageBadgeConfig,
  statusBadgeConfig,
} from "@/lib/components/badge-config"
import { getStageTargets, isTerminal } from "@/lib/domain/application-rules"
import { daysBetween, lastEventDate } from "@/lib/domain/dates"
import { STAGE_FLOW } from "@/lib/domain/stage-flow"
import { ApplicationEventField, Stage, Status } from "@/types/enums"
import { ApplicationEvent, JobApplication } from "@/types/job-application.types"
import { cn } from "cn"
import { useEffect, useRef, useState } from "react"

// Narrowest a step block may get before steps start to collapse.
const MIN_STEP_WIDTH = 140
const STEP_GAP = 4

interface ApplicationProgressCardProps {
  application: JobApplication
  // Ordered by sequence: oldest first.
  events: ApplicationEvent[]
  // Moves the application to another stage (same handler as Acciones).
  onStageChange: (stage: Stage) => Promise<unknown>
}

type StepState = "current" | "reached" | "skipped" | "upcoming"

const formatStepDate = (value: Date) =>
  value
    .toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
    .replace(".", "")

// Latest Stage event that moved the application into `stage`.
const findStageDate = (
  events: ApplicationEvent[],
  stage: Stage
): Date | undefined => {
  const matches = events.filter(
    (e) => e.field === ApplicationEventField.Stage && e.toValue === stage
  )
  const latest = matches[matches.length - 1]
  return latest ? new Date(latest.occurredAt) : undefined
}

// Mean calendar-day gap between consecutive events; null with fewer than 2.
const averageGap = (events: ApplicationEvent[]): number | null => {
  if (events.length < 2) return null
  const dates = events
    .map((e) => new Date(e.occurredAt))
    .sort((a, b) => a.getTime() - b.getTime())
  let total = 0
  for (let i = 1; i < dates.length; i++) {
    total += daysBetween(dates[i - 1], dates[i])
  }
  return Math.round(total / (dates.length - 1))
}

interface Step {
  stage: Stage
  state: StepState
  date?: Date
  // 1-based position in the full sequence, kept when steps collapse.
  position: number
}

// There is no fixed order between the middle stages, so the steps follow the
// path the application really took: the stages already reached (by the date
// each was last reached), then the current one, then the rest in the default
// flow order. Reaching Offer closes the flow: whatever was never reached is
// shown as skipped, right before the offer.
const buildSteps = (
  application: JobApplication,
  events: ApplicationEvent[]
): Step[] => {
  const applied = new Date(application.dateApplied)
  const current = application.stage
  const reachedAt = (stage: Stage): Date | undefined =>
    findStageDate(events, stage) ??
    (stage === Stage.Applied ? applied : undefined)

  const reached = STAGE_FLOW.filter(
    (stage) => stage !== current && reachedAt(stage) !== undefined
  )
    .map((stage) => ({
      stage,
      state: "reached" as const,
      date: reachedAt(stage),
    }))
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())

  const currentStep = {
    stage: current,
    state: "current" as const,
    date: reachedAt(current),
  }
  const isClosedByOffer = current === Stage.Offer
  const pending = STAGE_FLOW.filter(
    (stage) => stage !== current && reachedAt(stage) === undefined
  ).map((stage) => ({
    stage,
    state: isClosedByOffer ? ("skipped" as const) : ("upcoming" as const),
  }))

  const ordered = isClosedByOffer
    ? [...reached, ...pending, currentStep]
    : [...reached, currentStep, ...pending]
  return ordered.map((step, index) => ({ ...step, position: index + 1 }))
}

const stepStyles: Record<StepState, { box: string; secondary: string }> = {
  current: {
    box: "border-foreground bg-foreground text-background",
    secondary: "text-background/60",
  },
  reached: {
    box: "border-border bg-muted text-foreground",
    secondary: "text-muted-foreground",
  },
  skipped: {
    box: "border-dashed border-border bg-card text-muted-foreground",
    secondary: "text-muted-foreground",
  },
  upcoming: {
    box: "border-border bg-card text-muted-foreground",
    secondary: "text-muted-foreground",
  },
}

const pad = (position: number) => String(position).padStart(2, "0")

// Returns the handler that moves the application to a step's stage, or
// undefined when that step cannot be picked (only allowed pending stages can).
type MoveAction = (step: Step) => (() => void) | undefined

// Pending steps the user may jump to render as buttons: a hover state and a
// "Mover aquí" hint in place of the empty date tell them apart.
const movableClass =
  "group cursor-pointer text-left transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60"

// The border lives on the <li>, so it reacts to its button's hover.
const stepItemClass = "flex border has-[button:enabled:hover]:border-foreground"

const StepBlock = ({
  step,
  suffixes,
  getMove,
  isMoving,
}: {
  step: Step
  suffixes: Record<StepState, string>
  getMove: MoveAction
  isMoving: boolean
}) => {
  const styles = stepStyles[step.state]
  const move = getMove(step)
  const label = stageBadgeConfig[step.stage].label

  const content = (
    <>
      <span className={cn("font-mono text-xs", styles.secondary)}>
        {pad(step.position)}
        {suffixes[step.state]}
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold">{label}</span>
        <span
          className={cn("font-mono text-[11px] uppercase", styles.secondary)}
        >
          {move ? (
            <>
              <span className="group-hover:hidden group-focus-visible:hidden">
                —
              </span>
              <span className="hidden text-foreground group-hover:inline group-focus-visible:inline">
                Mover aquí →
              </span>
            </>
          ) : step.date ? (
            formatStepDate(step.date)
          ) : (
            "—"
          )}
        </span>
      </div>
    </>
  )

  const boxClass = "flex min-h-[120px] flex-col justify-between gap-3 p-4"

  return (
    <li
      className={cn(stepItemClass, styles.box)}
      aria-current={step.state === "current" ? "step" : undefined}
    >
      {move ? (
        <button
          type="button"
          title={`Mover a ${label}`}
          aria-label={`Mover a ${label}`}
          disabled={isMoving}
          onClick={move}
          className={cn(boxClass, "w-full", movableClass)}
        >
          {content}
        </button>
      ) : (
        <div className={cn(boxClass, "w-full")}>{content}</div>
      )}
    </li>
  )
}

// One block standing in for several steps that do not fit.
const SummaryBlock = ({
  title,
  steps,
  variant,
  getMove,
  isMoving,
}: {
  title: string
  steps: Step[]
  variant: "completed" | "pending"
  getMove: MoveAction
  isMoving: boolean
}) => {
  const first = steps[0].position
  const last = steps[steps.length - 1].position
  return (
    <li
      className={cn(
        "flex min-h-[120px] flex-col justify-between gap-3 border p-4",
        variant === "completed"
          ? stepStyles.reached.box
          : stepStyles.upcoming.box
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">
        {first === last ? pad(first) : `${pad(first)}–${pad(last)}`} · {title} (
        {steps.length})
      </span>
      <ul className="flex flex-col gap-1">
        {steps.map((step) => {
          const move = getMove(step)
          const label = stageBadgeConfig[step.stage].label
          return (
            <li
              key={step.stage}
              className="flex items-baseline justify-between gap-2 text-sm"
            >
              {move ? (
                <button
                  type="button"
                  title={`Mover a ${label}`}
                  aria-label={`Mover a ${label}`}
                  disabled={isMoving}
                  onClick={move}
                  className="cursor-pointer text-left font-semibold underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60"
                >
                  {label} →
                </button>
              ) : (
                <span
                  className={cn(
                    "font-semibold",
                    step.state === "skipped" && "font-normal line-through"
                  )}
                >
                  {label}
                </span>
              )}
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground uppercase">
                {step.state === "skipped"
                  ? "Omitida"
                  : step.date
                    ? formatStepDate(step.date)
                    : ""}
              </span>
            </li>
          )
        })}
      </ul>
    </li>
  )
}

// Collapse layout: shows every block that fits. When they don't, the pending
// steps fold into one "Pendientes" block; if that is still too wide, the
// completed ones fold into "Completados". The current step is always its own
// block. Below three blocks the steps become a compact vertical list.
const StepsCollapsed = ({
  steps,
  suffixes,
  getMove,
  isMoving,
}: {
  steps: Step[]
  suffixes: Record<StepState, string>
  getMove: MoveAction
  isMoving: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [capacity, setCapacity] = useState(steps.length)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () =>
      setCapacity(
        Math.floor((el.clientWidth + STEP_GAP) / (MIN_STEP_WIDTH + STEP_GAP))
      )
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const currentIndex = steps.findIndex((s) => s.state === "current")
  const before = steps.slice(0, currentIndex)
  const current = steps[currentIndex]
  const after = steps.slice(currentIndex + 1)

  const foldPending = steps.length > capacity && after.length > 0
  const withPendingFolded = before.length + 1 + (after.length > 0 ? 1 : 0)
  const foldCompleted =
    steps.length > capacity && withPendingFolded > capacity && before.length > 0

  if (capacity < 3) {
    return (
      <div ref={containerRef}>
        <ol className="flex flex-col gap-1">
          {steps.map((step) => {
            const styles = stepStyles[step.state]
            const move = getMove(step)
            const label = stageBadgeConfig[step.stage].label
            const rowClass =
              "flex w-full items-center justify-between gap-3 px-4 py-3"
            const content = (
              <>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className={cn("font-mono text-xs", styles.secondary)}>
                    {pad(step.position)}
                    {suffixes[step.state]}
                  </span>
                  <span className="truncate text-base font-semibold">
                    {label}
                  </span>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-mono text-[11px] uppercase",
                    styles.secondary
                  )}
                >
                  {move
                    ? "Mover aquí →"
                    : step.date
                      ? formatStepDate(step.date)
                      : "—"}
                </span>
              </>
            )
            return (
              <li
                key={step.stage}
                className={cn(stepItemClass, styles.box)}
                aria-current={step.state === "current" ? "step" : undefined}
              >
                {move ? (
                  <button
                    type="button"
                    aria-label={`Mover a ${label}`}
                    disabled={isMoving}
                    onClick={move}
                    className={cn(rowClass, movableClass)}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={rowClass}>{content}</div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  const blockCount =
    (foldCompleted ? 1 : before.length) + 1 + (foldPending ? 1 : after.length)

  return (
    <div ref={containerRef}>
      <ol
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${blockCount}, minmax(0, 1fr))`,
        }}
      >
        {foldCompleted ? (
          <SummaryBlock
            title="Completados"
            steps={before}
            variant="completed"
            getMove={getMove}
            isMoving={isMoving}
          />
        ) : (
          before.map((step) => (
            <StepBlock
              key={step.stage}
              step={step}
              suffixes={suffixes}
              getMove={getMove}
              isMoving={isMoving}
            />
          ))
        )}
        <StepBlock
          step={current}
          suffixes={suffixes}
          getMove={getMove}
          isMoving={isMoving}
        />
        {foldPending ? (
          <SummaryBlock
            title="Pendientes"
            steps={after}
            variant="pending"
            getMove={getMove}
            isMoving={isMoving}
          />
        ) : (
          after.map((step) => (
            <StepBlock
              key={step.stage}
              step={step}
              suffixes={suffixes}
              getMove={getMove}
              isMoving={isMoving}
            />
          ))
        )}
      </ol>
    </div>
  )
}

const ApplicationProgressCard = ({
  application,
  events,
  onStageChange,
}: ApplicationProgressCardProps) => {
  const isActive = application.status === Status.Active
  const applied = new Date(application.dateApplied)
  const steps = buildSteps(application, events)

  // Shortcut to the common action: pending stages the rules allow are
  // clickable. Status changes (reject, ignore...) stay in Acciones.
  const [isMoving, setIsMoving] = useState(false)
  const targets =
    isActive && !isTerminal(application) ? getStageTargets(application) : []
  const getMove: MoveAction = (step) =>
    step.state === "upcoming" && targets.includes(step.stage)
      ? async () => {
          setIsMoving(true)
          try {
            await onStageChange(step.stage)
          } finally {
            setIsMoving(false)
          }
        }
      : undefined

  const suffixes: Record<StepState, string> = {
    current: isActive ? " · Actual" : " · Última",
    reached: " ✓",
    skipped: " · Omitida",
    upcoming: "",
  }

  // Closed applications stop counting at their last event.
  const end = isActive ? new Date() : lastEventDate(events, applied)
  const daysInProcess = Math.max(0, daysBetween(applied, end))
  const stageStart = findStageDate(events, application.stage) ?? applied
  const daysInStage = Math.max(0, daysBetween(stageStart, end))
  const average = averageGap(events)
  const stageLabel = stageBadgeConfig[application.stage].label

  const stats = [
    {
      value: String(daysInProcess),
      label: daysInProcess === 1 ? "día en proceso" : "días en proceso",
    },
    {
      value: String(daysInStage),
      label: `${daysInStage === 1 ? "día" : "días"} en ${stageLabel}`,
    },
    {
      value: average === null ? "—" : String(average),
      label: "días promedio entre pasos",
    },
  ]

  return (
    <section className="flex flex-col gap-5 border border-border bg-card px-5 py-6 sm:px-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Progreso</h2>
        <span className="border border-foreground px-2 py-1.5 font-mono text-xs tracking-wider uppercase">
          {statusBadgeConfig[application.status].label}
        </span>
      </div>

      <StepsCollapsed
        steps={steps}
        suffixes={suffixes}
        getMove={getMove}
        isMoving={isMoving}
      />

      <dl className="grid grid-cols-3 gap-3 border-t border-border pt-[18px]">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <dd className="order-first text-[32px] leading-none font-medium tracking-tight tabular-nums">
              {stat.value}
            </dd>
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default ApplicationProgressCard
