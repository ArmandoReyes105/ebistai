"use client"

import TaiFigure from "@/components/tai/tai-figure"
import { Skeleton } from "@/components/ui/skeleton"
import { daysBetween } from "@/lib/domain/dates"
import { StateFilter } from "@/lib/domain/job-application-query"
import { JobApplication } from "@/types/job-application.types"
import { cn } from "cn"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface ApplicationsSummaryTilesProps {
  attention: JobApplication[] | null
  activeCount: number | null
  closedCount: number | null
  thresholdDays: number | null
  isLoading: boolean
  state: StateFilter
  onChange: (patch: { state: StateFilter; page: number }) => void
}

const TILE_BASE = "flex min-h-[72px] min-w-0 text-left"
const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
const LABEL =
  "font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase"
const BIG_NUMBER =
  "text-4xl leading-[0.9] font-medium tracking-tight tabular-nums"

const display = (value: number | null) => (value === null ? "—" : value)

const daysSince = (application: JobApplication) =>
  Math.max(
    0,
    daysBetween(
      new Date(application.lastProgressAt ?? application.dateApplied),
      new Date()
    )
  )

const attentionLabel = (count: number) =>
  `Tai: ${count} ${count === 1 ? "postulación necesita" : "postulaciones necesitan"} tu atención`

// Tai's corner: the figure plus the red counter of pending items. Below lg
// the tile has its own row, so Tai rests at the bottom; from lg it shares the
// row with Activas/Terminadas and sits centred.
function TaiCorner({ count }: { count: number | null }) {
  const hasAttention = count !== null && count > 0
  return (
    <div className="relative flex w-20 shrink-0 items-end justify-center self-stretch border-r border-border bg-muted pb-2.5 sm:w-24 lg:items-center lg:pb-0">
      <TaiFigure
        pose={hasAttention ? "neutral" : "sleep"}
        outlined={false}
        className="w-12 sm:w-14"
      />
      {hasAttention && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 inline-flex h-6 min-w-6 items-center justify-center bg-primary px-1.5 text-sm font-bold text-primary-foreground tabular-nums"
        >
          {count}
        </span>
      )}
    </div>
  )
}

// Folded content: the label, the count and a hint.
function TaiSummary({ count }: { count: number | null }) {
  const hasAttention = count !== null && count > 0
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-4 py-2.5">
      <span className={LABEL}>Tai · necesita tu atención</span>
      {/* The caption sits beside the number to keep the tile short. */}
      <span className="flex items-baseline gap-3">
        <span className={BIG_NUMBER}>{display(count)}</span>
        <span className="text-sm text-muted-foreground">
          {hasAttention
            ? "Toca para ver cuáles"
            : count === 0
              ? "Todo al día"
              : ""}
        </span>
      </span>
    </div>
  )
}

const pagerButtonClass = cn(
  "inline-flex size-7 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
  FOCUS_RING
)

// Sweep timings; they match the --animate-sweep-* tokens in globals.css.
const SWEEP_OUT_MS = 140
const SWEEP_IN_MS = 200

type View = "summary" | "list"
type Direction = "fwd" | "back"
type Phase = "idle" | "out" | "in"

const sweepClass = (phase: Phase, direction: Direction) =>
  phase === "out"
    ? direction === "fwd"
      ? "animate-sweep-out-fwd"
      : "animate-sweep-out-back"
    : phase === "in"
      ? direction === "fwd"
        ? "animate-sweep-in-fwd"
        : "animate-sweep-in-back"
      : undefined

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

function TaiTile({
  attention,
  thresholdDays,
}: Pick<ApplicationsSummaryTilesProps, "attention" | "thresholdDays">) {
  const count = attention?.length ?? null
  const [view, setView] = useState<View>("summary")
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const [direction, setDirection] = useState<Direction>("fwd")
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const previousView = useRef<View>("summary")

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Move focus into the list when it opens and back to the tile when it
  // closes, so keyboard users never lose their place.
  useEffect(() => {
    if (view === "list" && previousView.current === "summary") {
      nextButtonRef.current?.focus()
    } else if (view === "summary" && previousView.current === "list") {
      openButtonRef.current?.focus()
    }
    previousView.current = view
  }, [view])

  // Sweeps the current content out, applies the change, then sweeps the new
  // content in from the same side. Without motion the change is immediate.
  const transition = (dir: Direction, apply: () => void) => {
    if (phase !== "idle") return
    if (prefersReducedMotion()) {
      apply()
      return
    }
    setDirection(dir)
    setPhase("out")
    timers.current.push(
      setTimeout(() => {
        apply()
        setPhase("in")
        timers.current.push(setTimeout(() => setPhase("idle"), SWEEP_IN_MS))
      }, SWEEP_OUT_MS)
    )
  }

  // Fixed floor above both views' natural height (summary ~74px, list
  // ~70px), so swapping them never changes the tile height.
  const tileClass = cn(
    TILE_BASE,
    "col-span-2 min-h-[80px] items-stretch border border-border bg-card"
  )
  const contentClass = cn(
    "flex min-w-0 flex-1 motion-reduce:animate-none",
    sweepClass(phase, direction)
  )

  if (attention === null || attention.length === 0) {
    return (
      <div className={tileClass}>
        <TaiCorner count={count} />
        <TaiSummary count={count} />
      </div>
    )
  }

  if (view === "summary") {
    return (
      <button
        ref={openButtonRef}
        type="button"
        aria-label={attentionLabel(attention.length)}
        onClick={() =>
          transition("fwd", () => {
            setIndex(0)
            setView("list")
          })
        }
        className={cn(
          tileClass,
          "w-full cursor-pointer overflow-hidden transition-colors hover:bg-muted/30",
          FOCUS_RING
        )}
      >
        <TaiCorner count={count} />
        <div className={contentClass}>
          <TaiSummary count={count} />
        </div>
      </button>
    )
  }

  // Open: the same tile swaps its summary for the pending applications, one
  // at a time, with prev/next arrows (wrapping) and a close button.
  const total = attention.length
  // The list can shrink while open (a refresh after a change in the table):
  // clamp once and use it everywhere so the counter and the card agree.
  const safeIndex = Math.min(index, total - 1)
  const current = attention[safeIndex]
  const days = daysSince(current)
  const go = (step: 1 | -1) => {
    if (total < 2) return
    transition(step === 1 ? "fwd" : "back", () =>
      setIndex((safeIndex + step + total) % total)
    )
  }
  const close = () => transition("back", () => setView("summary"))
  // Escape must always work, even mid-sweep: cancel it and close at once.
  const closeNow = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase("idle")
    setView("summary")
  }

  return (
    <div
      role="group"
      aria-label={`Sin respuesta hace más de ${thresholdDays ?? "…"} días`}
      onKeyDown={(e) => {
        if (e.defaultPrevented) return
        if (e.key === "Escape") closeNow()
        if (e.key === "ArrowLeft") go(-1)
        if (e.key === "ArrowRight") go(1)
      }}
      className={cn(tileClass, "overflow-hidden")}
    >
      <TaiCorner count={count} />
      <div className={contentClass}>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(LABEL, "tabular-nums")} aria-live="polite">
              {String(safeIndex + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")} · Sin respuesta
            </span>
            <div className="-my-1 flex shrink-0 items-center">
              {total > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Anterior"
                    onClick={() => go(-1)}
                    className={pagerButtonClass}
                  >
                    <ChevronLeftIcon className="size-4" />
                  </button>
                  <button
                    ref={nextButtonRef}
                    type="button"
                    aria-label="Siguiente"
                    onClick={() => go(1)}
                    className={pagerButtonClass}
                  >
                    <ChevronRightIcon className="size-4" />
                  </button>
                </>
              )}
              <button
                ref={total > 1 ? undefined : nextButtonRef}
                type="button"
                aria-label="Cerrar"
                onClick={close}
                className={pagerButtonClass}
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </div>

          <Link
            href={`/job-applications/${current.id}`}
            className={cn(
              "flex min-w-0 items-baseline justify-between gap-3 hover:underline",
              FOCUS_RING
            )}
          >
            <span className="min-w-0 truncate">
              <span className="text-base font-semibold">
                {current.jobTitle}
              </span>
              <span className="text-sm text-muted-foreground">
                {" "}
                · {current.company}
              </span>
            </span>
            <span className="shrink-0 font-mono text-xs text-primary-text tabular-nums">
              {days} {days === 1 ? "día" : "días"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

const ApplicationsSummaryTiles = ({
  attention,
  activeCount,
  closedCount,
  thresholdDays,
  isLoading,
  state,
  onChange,
}: ApplicationsSummaryTilesProps) => {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
        aria-hidden="true"
      >
        <Skeleton className="col-span-2 min-h-[80px]" />
        <Skeleton className="min-h-[72px]" />
        <Skeleton className="min-h-[72px]" />
      </div>
    )
  }

  // Clicking the selected tile goes back to "all".
  const toggle = (target: "active" | "closed") =>
    onChange({ state: state === target ? "all" : target, page: 1 })

  return (
    <section
      aria-label="Resumen de postulaciones"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
    >
      {/* Remounts when the list empties or refills, so an open browser never
          survives with nothing to show (resets its view, index and focus). */}
      <TaiTile
        key={attention && attention.length > 0 ? "pending" : "clear"}
        attention={attention}
        thresholdDays={thresholdDays}
      />

      <button
        type="button"
        aria-pressed={state === "active"}
        onClick={() => toggle("active")}
        className={cn(
          TILE_BASE,
          "cursor-pointer flex-col justify-between gap-2 border bg-card px-4 py-3 transition-colors hover:bg-muted/50",
          state === "active" ? "border-foreground" : "border-border",
          FOCUS_RING
        )}
      >
        <span className={LABEL}>Activas</span>
        <span className={BIG_NUMBER}>{display(activeCount)}</span>
      </button>

      <button
        type="button"
        aria-pressed={state === "closed"}
        onClick={() => toggle("closed")}
        className={cn(
          TILE_BASE,
          "cursor-pointer flex-col justify-between gap-2 border bg-muted px-4 py-3 transition-colors hover:bg-muted/80",
          state === "closed" ? "border-foreground" : "border-transparent",
          FOCUS_RING
        )}
      >
        <span className={LABEL}>Terminadas</span>
        <span className="flex items-end justify-between gap-2">
          <span className={BIG_NUMBER}>{display(closedCount)}</span>
          <TaiFigure pose="sleep" outlined={false} className="w-16 shrink-0" />
        </span>
      </button>
    </section>
  )
}

export default ApplicationsSummaryTiles
