"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  JobApplicationFilters,
  SortOption,
  StateFilter,
  hasActiveFilters,
} from "@/lib/domain/job-application-query"
import {
  EnumOption,
  stageOptions,
  statusOptions,
  workModeOptions,
} from "@/types/enums-options"
import { JobApplicationSource } from "@/types/job-application.types"
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const SEARCH_DEBOUNCE_MS = 300

const stateItems: { value: StateFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "closed", label: "Terminadas" },
]

const sortItems: { value: SortOption; label: string }[] = [
  { value: "progress", label: "Último avance" },
  { value: "applied", label: "Fecha de postulación" },
  { value: "company", label: "Empresa" },
]

// Select value meaning "no source filter".
const ALL_SOURCES = "all"

interface ChipFilterProps<T extends number> {
  label: string
  options: EnumOption<T>[]
  value: T[]
  onChange: (value: T[]) => void
}

// Multi-select shown as chips so every option is visible at once.
// An empty selection means "no filter".
function ChipFilter<T extends number>({
  label,
  options,
  value,
  onChange,
}: ChipFilterProps<T>) {
  return (
    <fieldset className="flex flex-col">
      <legend className="mb-2 text-xs font-medium">{label}</legend>
      <ToggleGroup
        multiple
        aria-label={`Filtrar por ${label.toLowerCase()}`}
        variant="outline"
        size="sm"
        spacing={1.5}
        className="w-full flex-wrap"
        value={value.map(String)}
        onValueChange={(next) => onChange(next.map((v) => Number(v) as T))}
      >
        {options.map((o) => (
          <ToggleGroupItem
            key={o.value}
            value={String(o.value)}
            className="data-pressed:border-primary data-pressed:bg-primary/10 data-pressed:text-primary"
          >
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </fieldset>
  )
}

interface SearchInputProps {
  initialValue: string
  onSearch: (value: string) => void
}

// Owns the typed text; the URL only receives the debounced value.
function SearchInput({ initialValue, onSearch }: SearchInputProps) {
  const [text, setText] = useState(initialValue)
  const [syncedValue, setSyncedValue] = useState(initialValue)
  const [sentValue, setSentValue] = useState(initialValue)

  // Resync when the URL changes from outside (back/forward, "Limpiar filtros"),
  // but not when it is just echoing what this input already sent.
  if (initialValue !== syncedValue) {
    setSyncedValue(initialValue)
    if (initialValue !== sentValue) setText(initialValue)
  }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSearchRef = useRef(onSearch)
  useEffect(() => {
    onSearchRef.current = onSearch
  })
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const handleChange = (next: string) => {
    setText(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const value = next.trim()
      setSentValue(value)
      onSearchRef.current(value)
    }, SEARCH_DEBOUNCE_MS)
  }

  return (
    <div className="relative w-full sm:w-64">
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label="Buscar por puesto o empresa"
        placeholder="Buscar puesto o empresa"
        className="pl-8"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  )
}

interface JobApplicationFiltersBarProps {
  filters: JobApplicationFilters
  sources: JobApplicationSource[]
  onChange: (patch: Partial<JobApplicationFilters>) => void
  onClear: () => void
}

// The bar keeps the everyday controls (search, state, sort); the rest live
// in a side panel opened from "Filtros".
const JobApplicationFiltersBar = ({
  filters,
  sources,
  onChange,
  onClear,
}: JobApplicationFiltersBarProps) => {
  // Remounting the search input is how "clear" resets its typed text.
  const [clearCount, setClearCount] = useState(0)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const sourceItems = [
    { value: ALL_SOURCES, label: "Todas las fuentes" },
    ...sources.map((s) => ({ value: String(s.id), label: s.name })),
  ]

  // Selections made in the side panel, shown as a count on its button.
  const panelCount =
    filters.status.length +
    filters.stage.length +
    filters.mode.length +
    (filters.sourceId === null ? 0 : 1)

  const handleClear = () => {
    setClearCount((c) => c + 1)
    onClear()
  }

  return (
    <div
      role="search"
      aria-label="Filtros de postulaciones"
      className="flex flex-wrap items-center gap-2"
    >
      <SearchInput
        key={clearCount}
        initialValue={filters.q}
        onSearch={(q) => onChange({ q })}
      />

      <ToggleGroup
        aria-label="Estado de las postulaciones"
        variant="outline"
        spacing={0}
        value={[filters.state]}
        onValueChange={(next) => {
          // Ignore the "untoggle" event: one option is always selected.
          if (next[0]) onChange({ state: next[0] as StateFilter })
        }}
      >
        {stateItems.map((s) => (
          <ToggleGroupItem key={s.value} value={s.value}>
            {s.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Select
        items={sortItems}
        value={filters.sort}
        onValueChange={(next) => next && onChange({ sort: next as SortOption })}
      >
        <SelectTrigger aria-label="Ordenar por">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          <SelectGroup>
            {sortItems.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {hasActiveFilters(filters) && (
        <Button variant="ghost" onClick={handleClear}>
          <XIcon data-icon="inline-start" />
          Limpiar filtros
        </Button>
      )}

      {/* Pushed to the far right; everything else stays on the left. */}
      <Button
        variant="outline"
        className="ml-auto"
        aria-label={
          panelCount > 0 ? `Filtros, ${panelCount} activos` : "Filtros"
        }
        onClick={() => setIsPanelOpen(true)}
      >
        <SlidersHorizontalIcon data-icon="inline-start" />
        Filtros
        {panelCount > 0 && (
          <span className="ml-0.5 inline-flex size-4 items-center justify-center bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
            {panelCount}
          </span>
        )}
      </Button>

      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Los cambios se aplican al momento.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
            <ChipFilter
              label="Estatus"
              options={statusOptions}
              value={filters.status}
              onChange={(status) => onChange({ status })}
            />
            <ChipFilter
              label="Etapa"
              options={stageOptions}
              value={filters.stage}
              onChange={(stage) => onChange({ stage })}
            />
            <ChipFilter
              label="Modalidad"
              options={workModeOptions}
              value={filters.mode}
              onChange={(mode) => onChange({ mode })}
            />

            <div className="flex flex-col gap-2">
              <span id="source-filter-label" className="text-xs font-medium">
                Fuente
              </span>
              <Select
                items={sourceItems}
                value={
                  filters.sourceId === null
                    ? ALL_SOURCES
                    : String(filters.sourceId)
                }
                onValueChange={(next) =>
                  onChange({
                    sourceId:
                      next === null || next === ALL_SOURCES
                        ? null
                        : Number(next),
                  })
                }
              >
                <SelectTrigger
                  aria-labelledby="source-filter-label"
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start">
                  <SelectGroup>
                    {sourceItems.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="flex-row border-t">
            <Button
              variant="ghost"
              className="flex-1"
              disabled={!hasActiveFilters(filters)}
              onClick={handleClear}
            >
              Limpiar todo
            </Button>
            <Button className="flex-1" onClick={() => setIsPanelOpen(false)}>
              Ver resultados
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default JobApplicationFiltersBar
