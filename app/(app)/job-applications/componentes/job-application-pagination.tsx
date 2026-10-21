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
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
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

  // Square 44px cells that share borders; the outline variant's dark-mode
  // tint is overridden so they sit on the card colour in both themes.
  const navButtonClassName =
    "size-11 rounded-none border border-input bg-card text-foreground hover:bg-muted dark:border-input dark:bg-card dark:hover:bg-muted"

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-5 py-4">
      {/* Left: the visible range and the page size; right: the pages. */}
      <div className="flex flex-wrap items-center gap-4">
        <p
          aria-live="polite"
          className="flex items-center gap-2 font-mono text-xs text-muted-foreground tabular-nums"
        >
          {totalCount === 0 ? (
            "0 de 0"
          ) : (
            <span>
              {from}–{to} de {totalCount}
            </span>
          )}
          {isFetching && <Spinner aria-label="Actualizando lista" />}
        </p>

        <div className="flex items-center gap-2">
          <span
            id="page-size-label"
            className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
          >
            Por página
          </span>
          <Select
            items={sizeItems}
            value={String(pageSize)}
            onValueChange={(next) => next && onPageSizeChange(Number(next))}
          >
            <SelectTrigger
              aria-labelledby="page-size-label"
              className="w-[72px] border-input bg-card px-3 text-sm data-[size=default]:h-11 dark:bg-card dark:hover:bg-muted"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
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
      </div>

      {/* Always shown, like the mockup: with one page the arrows are disabled. */}
      {totalPages > 0 && (
        <nav aria-label="Paginación" className="flex items-center">
          <Button
            variant="outline"
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={navButtonClassName}
          >
            <ArrowLeftIcon />
          </Button>

          {/* Mobile: compact "2 / 8" instead of the page list. */}
          <span className="-ml-px flex h-11 items-center border border-input bg-card px-3 text-xs text-muted-foreground tabular-nums sm:hidden">
            <span className="font-semibold text-foreground">{page}</span>
            &nbsp;/ {totalPages}
          </span>

          {getPageItems(page, totalPages).map((item) =>
            typeof item === "string" ? (
              <span
                key={item}
                aria-hidden
                className="-ml-px hidden h-11 w-11 items-center justify-center border border-input bg-card text-xs text-muted-foreground sm:inline-flex"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                variant="outline"
                aria-label={`Ir a la página ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  navButtonClassName,
                  "-ml-px hidden tabular-nums sm:inline-flex",
                  item === page &&
                    "border-foreground bg-foreground font-semibold text-background hover:bg-foreground dark:border-foreground dark:bg-foreground dark:hover:bg-foreground"
                )}
              >
                {item}
              </Button>
            )
          )}

          <Button
            variant="outline"
            aria-label="Página siguiente"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(navButtonClassName, "-ml-px")}
          >
            <ArrowRightIcon />
          </Button>
        </nav>
      )}
    </div>
  )
}

export default JobApplicationPagination
