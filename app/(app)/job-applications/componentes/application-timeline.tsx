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
import { actorLabels, describeEvent } from "@/lib/domain/application-rules"
import { ApplicationEvent } from "@/types/job-application.types"
import { CalendarIcon, Undo2 } from "lucide-react"
import { useState } from "react"

interface ApplicationTimelineProps {
  // Ordered by sequence: oldest first.
  events: ApplicationEvent[]
  onUpdateDate: (eventId: string, occurredAt: Date) => Promise<boolean>
  onUndo: (eventId: string) => Promise<boolean>
}

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

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

interface TimelineItemProps {
  event: ApplicationEvent
  onUpdateDate: (eventId: string, occurredAt: Date) => Promise<boolean>
  onUndo: (eventId: string) => Promise<boolean>
}

const TimelineItem = ({ event, onUpdateDate, onUndo }: TimelineItemProps) => {
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
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{sentence}</span>
        <span className="text-xs text-muted-foreground">
          {formatDate(occurredAt)} · {actorLabels[event.actor] ?? "Sistema"}
        </span>
      </div>

      <div className="flex items-center gap-2">
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
          <PopoverContent>
            <Calendar
              mode="single"
              selected={occurredAt}
              defaultMonth={occurredAt}
              disabled={{ after: new Date() }}
              onSelect={handleSelectDate}
            />
          </PopoverContent>
        </Popover>

        {event.canUndo && (
          <>
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
            <AlertDialog open={isUndoOpen} onOpenChange={setIsUndoOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Deshacer este cambio?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vamos a quitar «{sentence}» de tu historial y tu
                    postulación volverá a como estaba antes.
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
          </>
        )}
      </div>
    </li>
  )
}

const ApplicationTimeline = ({
  events,
  onUpdateDate,
  onUndo,
}: ApplicationTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial</CardTitle>
        <CardDescription>
          Cada paso de tu proceso, del más antiguo al más reciente.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <ol className="flex flex-col divide-y">
          {events.map((event) => (
            <TimelineItem
              key={event.id}
              event={event}
              onUpdateDate={onUpdateDate}
              onUndo={onUndo}
            />
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export default ApplicationTimeline
