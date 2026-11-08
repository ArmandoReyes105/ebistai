"use client"

import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface ApplicationNotesCardProps {
  notes?: string | null
  onEdit: () => void
}

const ApplicationNotesCard = ({ notes, onEdit }: ApplicationNotesCardProps) => {
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  // Shows "Ver más" only when the clamped text is actually cut off.
  useEffect(() => {
    const body = bodyRef.current
    if (!body || isExpanded) return

    const measure = () =>
      setIsOverflowing(body.scrollHeight > body.clientHeight + 1)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(body)
    return () => observer.disconnect()
  }, [notes, isExpanded])

  return (
    <section
      aria-labelledby="notes-title"
      className="flex flex-col gap-3 border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="notes-title" className="text-xl font-semibold">
          Notas
        </h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium hover:underline"
        >
          Editar
        </button>
      </div>

      <p
        id="notes-body"
        ref={bodyRef}
        className={cn(
          "bg-muted px-4 py-3.5 text-[15px] leading-relaxed wrap-anywhere whitespace-pre-wrap",
          !isExpanded && "line-clamp-4"
        )}
      >
        {notes ? (
          notes
        ) : (
          <span className="text-muted-foreground">
            Aún no tienes notas aquí.
          </span>
        )}
      </p>

      {(isOverflowing || isExpanded) && (
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls="notes-body"
          onClick={() => setIsExpanded((value) => !value)}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium hover:underline"
        >
          {isExpanded ? "Ver menos" : "Ver más"}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>
      )}
    </section>
  )
}

export default ApplicationNotesCard
