"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  stageBadgeConfig,
  statusBadgeConfig,
} from "@/lib/components/badge-config"
import { actorLabels, describeEvent } from "@/lib/domain/application-rules"
import { daysBetween, pluralDays } from "@/lib/domain/dates"
import { getNextStage, getReachedStages } from "@/lib/domain/stage-flow"
import { ApplicationEventField, Stage, Status } from "@/types/enums"
import { ApplicationEvent } from "@/types/job-application.types"
import { CalendarCog, Undo2 } from "lucide-react"
import { cn } from "cn"
import { useState } from "react"

interface ApplicationTimelineProps {
  // Ordered by sequence: oldest first.
  events: ApplicationEvent[]
  // Current status of the application; only open ones show the next stage.
  status: Status
  // Current stage; decides which stage is shown as the upcoming one.
  stage: Stage
  onUpdateDate: (eventId: string, occurredAt: Date) => Promise<boolean>
  onUndo: (eventId: string) => Promise<boolean>
}

const formatDate = (value: Date) =>
  value.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

// Always in days ("Hace 64 días") so steps are easy to compare.
const formatAgo = (value: Date): string => {
  const days = daysBetween(value, new Date())
  if (days <= 0) return "Hoy"
  if (days === 1) return "Ayer"
  return `Hace ${pluralDays(days)}`
}

const formatGap = (days: number): string =>
  days <= 0
    ? "el mismo día que el paso anterior"
    : `${pluralDays(days)} después del paso anterior`

// Square node on the rail: ink for past steps, red for the latest one
// (open or closed: it only marks "this is the last step").
const nodeClass = (isLast: boolean) => (isLast ? "bg-primary" : "bg-foreground")

// The calendar only picks a day; keep the original time of day so ordering
// against neighbouring events still works, and never go past "now".
const mergePickedDay = (picked: Date, original: Date): Date => {
  const merged = new Date(picked)
  merged.setHours(
    original.getHours(),
    original.getMinutes(),
    original.getSeconds(),
    original.getMilliseconds()
  )
  const now = new Date()
  return merged > now ? now : merged
}

const EventLabel = ({
  event,
  isCurrent,
}: {
  event: ApplicationEvent
  isCurrent: boolean
}) => {
  const config =
    event.field === ApplicationEventField.Stage
      ? stageBadgeConfig[event.toValue as Stage]
      : statusBadgeConfig[event.toValue as Status]
  if (!config) return null

  return (
    <span
      className={cn(
        "font-mono text-[11px] font-semibold tracking-wider uppercase",
        isCurrent ? "text-primary-text" : "text-muted-foreground"
      )}
    >
      {config.label}
    </span>
  )
}

interface TimelineItemProps {
  event: ApplicationEvent
  // Days since the previous event; undefined for the first one.
  gapDays?: number
  // Position in the timeline; staggers the connector wave.
  index: number
  isLast: boolean
  // Whether the dashed "next" row follows this item.
  hasNext: boolean
  onUpdateDate: (eventId: string, occurredAt: Date) => Promise<boolean>
  onUndo: (eventId: string) => Promise<boolean>
}

const TimelineItem = ({
  event,
  gapDays,
  index,
  isLast,
  hasNext,
  onUpdateDate,
  onUndo,
}: TimelineItemProps) => {
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isUndoOpen, setIsUndoOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  const occurredAt = new Date(event.occurredAt)
  const sentence = describeEvent(event)

  const handleSelectDate = async (date: Date | undefined) => {
    if (!date) return
    setIsDateOpen(false)
    setIsBusy(true)
    try {
      await onUpdateDate(event.id, mergePickedDay(date, occurredAt))
    } finally {
      setIsBusy(false)
    }
  }

  const handleUndo = async () => {
    setIsBusy(true)
    try {
      await onUndo(event.id)
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <li
      className={cn("relative pl-11", isLast && !hasNext ? "pb-0" : "pb-7")}
      aria-current={isLast ? "step" : undefined}
    >
      {/* Solid connector to the next row, touching both nodes. */}
      {(!isLast || hasNext) && (
        <span
          aria-hidden
          className="absolute top-4.5 -bottom-0.5 left-2.75 w-0.5 bg-border"
        >
          {/* A highlight that travels down the line towards the next step;
              staggered per step so it reads as one wave. */}
          <span
            className="timeline-wave absolute inset-0 bg-primary"
            style={{ animationDelay: `${index * 0.35}s` }}
          />
        </span>
      )}

      <span
        aria-hidden
        className={cn("absolute top-0.5 left-1.25 size-3.5", nodeClass(isLast))}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <EventLabel event={event} isCurrent={isLast} />
          <span className="text-[17px] leading-snug font-semibold text-foreground">
            {sentence}
          </span>
          <span className="text-sm text-muted-foreground">
            <time
              dateTime={occurredAt.toISOString()}
              className="first-letter:uppercase"
            >
              {formatDate(occurredAt)}
            </time>
            {" · "}
            <span className="tabular-nums">{formatAgo(occurredAt)}</span>
            {" · "}
            {actorLabels[event.actor] ?? "Sistema"}
          </span>
          {gapDays !== undefined && (
            <span className="mt-1 w-fit bg-muted px-2 py-1.5 font-mono text-[11px] tracking-wide text-foreground/80 uppercase tabular-nums">
              {formatGap(gapDays)}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Only the latest step can be undone. */}
          {isLast && event.canUndo && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-lg"
                    disabled={isBusy}
                    aria-label={`Deshacer: ${sentence}`}
                    onClick={() => setIsUndoOpen(true)}
                  />
                }
              >
                <Undo2 />
              </TooltipTrigger>
              <TooltipContent>Deshacer</TooltipContent>
            </Tooltip>
          )}
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-lg"
                        disabled={isBusy}
                        aria-label={`Cambiar la fecha de: ${sentence}`}
                      />
                    }
                  />
                }
              >
                <CalendarCog />
              </TooltipTrigger>
              <TooltipContent>Cambiar fecha</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto" align="end">
              <Calendar
                mode="single"
                selected={occurredAt}
                defaultMonth={occurredAt}
                disabled={{ after: new Date() }}
                onSelect={handleSelectDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {event.canUndo && (
        <AlertDialog open={isUndoOpen} onOpenChange={setIsUndoOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Deshacer este cambio?</AlertDialogTitle>
              <AlertDialogDescription>
                Vamos a quitar «{sentence}» de tu historial y tu postulación
                volverá a como estaba antes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mejor no</AlertDialogCancel>
              <AlertDialogAction onClick={handleUndo}>
                Sí, deshacer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </li>
  )
}

// Purely visual hint of the stage that would come next; not interactive.
const NextStageItem = ({ stage }: { stage: Stage }) => (
  <li className="relative pl-11">
    <span
      aria-hidden
      className="absolute top-0.5 left-1.25 size-3.5 border-2 border-dashed border-muted-foreground"
    />
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Siguiente
      </span>
      <span className="text-[15px] leading-snug text-muted-foreground">
        {stageBadgeConfig[stage].label} · aún sin fecha
      </span>
    </div>
  </li>
)

const ApplicationTimeline = ({
  events,
  status,
  stage,
  onUpdateDate,
  onUndo,
}: ApplicationTimelineProps) => {
  const nextStage =
    status === Status.Active
      ? getNextStage(stage, getReachedStages(events))
      : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Historial</CardTitle>
        <CardAction className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          {events.length} {events.length === 1 ? "paso" : "pasos"}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {events.map((event, index) => {
            const previous = events[index - 1]
            return (
              <TimelineItem
                key={event.id}
                event={event}
                gapDays={
                  previous
                    ? daysBetween(
                        new Date(previous.occurredAt),
                        new Date(event.occurredAt)
                      )
                    : undefined
                }
                index={index}
                isLast={index === events.length - 1}
                hasNext={nextStage !== undefined}
                onUpdateDate={onUpdateDate}
                onUndo={onUndo}
              />
            )
          })}
          {nextStage !== undefined && <NextStageItem stage={nextStage} />}
        </ol>
      </CardContent>
    </Card>
  )
}

export default ApplicationTimeline
