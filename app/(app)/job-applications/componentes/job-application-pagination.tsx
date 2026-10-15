"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { PAGE_SIZES } from "@/lib/domain/job-application-query"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"

type PageItem = number | "ellipsis-start" | "ellipsis-end"

// Compact page list: first, last, the current page and its neighbours.
export function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p))
  if (page >= totalPages - 2) {
    ;[totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) =>
      pages.add(p)
    )
  }
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const items: PageItem[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) {
      items.push(i === 1 ? "ellipsis-start" : "ellipsis-end")
    }
    items.push(p)
  })
  return items
}

interface JobApplicationPaginationProps {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  isFetching: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const JobApplicationPagination = ({
  page,
  pageSize,
  totalCount,
  totalPages,
  isFetching,
  onPageChange,
  onPageSizeChange,
}: JobApplicationPaginationProps) => {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)
  const sizeItems = PAGE_SIZES.map((s) => ({
    value: String(s),
    label: String(s),
  }))

  const hasPages = totalPages > 1

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-background px-2 py-2">
      <p
        aria-live="polite"
        className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums"
      >
        {totalCount === 0 ? (
          "0 postulaciones"
        ) : (
          <span>
            <span className="font-medium text-foreground">
              {from}–{to}
            </span>{" "}
            de <span className="font-medium text-foreground">{totalCount}</span>{" "}
            postulaciones
          </span>
        )}
        {isFetching && <Spinner aria-label="Actualizando lista" />}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span id="page-size-label">Por página</span>
          <Select
            items={sizeItems}
            value={String(pageSize)}
            onValueChange={(next) => next && onPageSizeChange(Number(next))}
          >
            <SelectTrigger
              size="sm"
              aria-labelledby="page-size-label"
              className="w-16"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="end">
              <SelectGroup>
                {sizeItems.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* A single page needs no navigation. */}
        {hasPages && (
          <nav aria-label="Paginación" className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Página anterior"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeftIcon />
            </Button>

            {/* Mobile: compact "2 / 8" instead of the page list. */}
            <span className="px-2 text-xs text-muted-foreground tabular-nums sm:hidden">
              <span className="font-medium text-foreground">{page}</span> /{" "}
              {totalPages}
            </span>

            {getPageItems(page, totalPages).map((item) =>
              typeof item === "string" ? (
                <span
                  key={item}
                  aria-hidden
                  className="hidden px-1 text-xs text-muted-foreground sm:inline"
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === page ? "default" : "ghost"}
                  size="icon-sm"
                  aria-label={`Ir a la página ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => onPageChange(item)}
                  className={cn(
                    "hidden tabular-nums sm:inline-flex",
                    item !== page && "text-muted-foreground"
                  )}
                >
                  {item}
                </Button>
              )
            )}

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Página siguiente"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </nav>
        )}
      </div>
    </div>
  )
}

export default JobApplicationPagination
