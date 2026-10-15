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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
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
import { ApplicationEventField, Stage, Status } from "@/types/enums"
import { ApplicationEvent } from "@/types/job-application.types"
import { CalendarCog, CalendarIcon, Undo2 } from "lucide-react"
import { cn } from "cn"
import { useState } from "react"

interface ApplicationTimelineProps {
  // Ordered by sequence: oldest first.
  events: ApplicationEvent[]
  // Current status of the application; decides how the last step is drawn.
  status: Status
  onUpdateDate: (eventId: string, occurredAt: Date) => Promise<boolean>
  onUndo: (eventId: string) => Promise<boolean>
}

const DAY_MS = 24 * 60 * 60 * 1000

const formatDate = (value: Date) =>
  value.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()

// Whole calendar days between two dates, ignoring the time of day.
const daysBetween = (from: Date, to: Date) =>
  Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS)

const pluralDays = (days: number) => (days === 1 ? "1 día" : `${days} días`)

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

// Dot colour of the last step once the application is closed.
const outcomeDotClass: Record<Status, string> = {
  [Status.Active]: "bg-primary",
  [Status.OfferAccepted]: "bg-emerald-500",
  [Status.Rejected]: "bg-rose-500",
  [Status.OfferDeclined]: "bg-orange-500",
  [Status.Ignored]: "bg-zinc-400",
  [Status.Withdrawn]: "bg-zinc-400",
  [Status.PositionClosed]: "bg-zinc-400",
}

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

// Experiment: show the stage/status as coloured uppercase text instead of a
// badge. Reuses the badge palette, keeping only its text colours.
const textColorOnly = (className: string) =>
  className
    .split(" ")
    .filter((c) => !c.includes("bg-"))
    .join(" ")

const EventLabel = ({ event }: { event: ApplicationEvent }) => {
  const config =
    event.field === ApplicationEventField.Stage
      ? stageBadgeConfig[event.toValue as Stage]
      : statusBadgeConfig[event.toValue as Status]
  if (!config) return null

  return (
    <span
      className={cn(
        "text-[11px] font-semibold tracking-wider uppercase",
        textColorOnly(config.className)
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
  status: Status
  onUpdateDate: (eventId: string, occurredAt: Date) => Promise<boolean>
  onUndo: (eventId: string) => Promise<boolean>
}

const TimelineItem = ({
  event,
  gapDays,
  index,
  isLast,
  status,
  onUpdateDate,
  onUndo,
}: TimelineItemProps) => {
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isUndoOpen, setIsUndoOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  const occurredAt = new Date(event.occurredAt)
  const sentence = describeEvent(event)
  const isOngoing = isLast && status === Status.Active

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

  const datePicker = (
    <PopoverContent className="w-auto" align={isLast ? "start" : "end"}>
      <Calendar
        mode="single"
        selected={occurredAt}
        defaultMonth={occurredAt}
        disabled={{ after: new Date() }}
        onSelect={handleSelectDate}
      />
    </PopoverContent>
  )

  return (
    <li
      className={cn(
        "relative pl-8",
        isLast ? (isOngoing ? "pb-10" : "pb-0") : "pb-6"
      )}
      aria-current={isLast ? "step" : undefined}
    >
      {/* Dotted connector to the next step, leaving a gap around both dots;
          the ongoing last step trails off in the primary colour. */}
      {(!isLast || isOngoing) && (
        <span
          aria-hidden
          className={cn(
            "absolute left-1.5 w-1 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[4px_6px] bg-repeat-y",
            isOngoing
              ? "top-5.5 h-12 text-primary/70"
              : "top-5 bottom-0 text-muted-foreground/40"
          )}
        >
          {/* A highlight that travels down the dotted line towards the next
              step; staggered per step so it reads as one wave. */}
          {!isLast && (
            <span
              className="timeline-wave absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[4px_6px] bg-repeat-y text-primary"
              style={{ animationDelay: `${index * 0.35}s` }}
            />
          )}
        </span>
      )}

      <span
        aria-hidden
        className={cn(
          "absolute top-2.5 left-2 flex -translate-1/2 rounded-full",
          isLast
            ? cn("size-3", outcomeDotClass[status])
            : "size-2 bg-muted-foreground/50"
        )}
      >
        {isOngoing && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50 motion-reduce:hidden" />
        )}
      </span>

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span
            className={cn(
              "text-sm font-medium",
              isLast ? "text-foreground" : "text-foreground/80"
            )}
          >
            {sentence}
          </span>
          <span className="text-xs text-muted-foreground">
            <time
              dateTime={occurredAt.toISOString()}
              className="first-letter:uppercase"
            >
              {formatDate(occurredAt)}
            </time>
            {" · "}
            {actorLabels[event.actor] ?? "Sistema"}
          </span>
          <span className="text-xs text-muted-foreground/80 tabular-nums">
            {formatAgo(occurredAt)}
            {gapDays !== undefined && ` · ${formatGap(gapDays)}`}
          </span>
          <div className="mt-0.5">
            <EventLabel event={event} />
          </div>
        </div>

        {/* Earlier steps only get a compact icon button in the side column. */}
        {!isLast && (
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={isBusy}
                        className="shrink-0"
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
            {datePicker}
          </Popover>
        )}
      </div>

      {/* The latest step gets its full actions underneath. */}
      {isLast && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {event.canUndo && (
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              aria-label={`Deshacer: ${sentence}`}
              onClick={() => setIsUndoOpen(true)}
            >
              <Undo2 data-icon="inline-start" />
              Deshacer
            </Button>
          )}
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  aria-label={`Cambiar la fecha de: ${sentence}`}
                />
              }
            >
              <CalendarIcon data-icon="inline-start" />
              Cambiar fecha
            </PopoverTrigger>
            {datePicker}
          </Popover>
        </div>
      )}

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

const ApplicationTimeline = ({
  events,
  status,
  onUpdateDate,
  onUndo,
}: ApplicationTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial</CardTitle>
        <CardDescription>
          Tu proceso, paso a paso.
        </CardDescription>
      </CardHeader>
      <Separator />
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
                status={status}
                onUpdateDate={onUpdateDate}
                onUndo={onUndo}
              />
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

export default ApplicationTimeline
