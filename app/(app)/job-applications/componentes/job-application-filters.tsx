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
import { SearchIcon, XIcon } from "lucide-react"
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

interface MultiFilterProps<T extends number> {
  label: string
  allLabel: string
  options: EnumOption<T>[]
  value: T[]
  onChange: (value: T[]) => void
}

// Multi-select: an empty selection means "no filter".
function MultiFilter<T extends number>({
  label,
  allLabel,
  options,
  value,
  onChange,
}: MultiFilterProps<T>) {
  const summary = () => {
    if (value.length === 0) return allLabel
    if (value.length === 1) {
      return options.find((o) => o.value === value[0])?.label ?? allLabel
    }
    return `${label}: ${value.length}`
  }

  return (
    <Select
      multiple
      items={options}
      value={value}
      onValueChange={(next) => onChange(next as T[])}
    >
      <SelectTrigger aria-label={`Filtrar por ${label.toLowerCase()}`}>
        <SelectValue>{summary}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
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

const JobApplicationFiltersBar = ({
  filters,
  sources,
  onChange,
  onClear,
}: JobApplicationFiltersBarProps) => {
  // Remounting the search input is how "clear" resets its typed text.
  const [clearCount, setClearCount] = useState(0)

  const sourceItems = [
    { value: ALL_SOURCES, label: "Todas las fuentes" },
    ...sources.map((s) => ({ value: String(s.id), label: s.name })),
  ]

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

      <MultiFilter
        label="Estatus"
        allLabel="Todos los estatus"
        options={statusOptions}
        value={filters.status}
        onChange={(status) => onChange({ status })}
      />
      <MultiFilter
        label="Etapa"
        allLabel="Todas las etapas"
        options={stageOptions}
        value={filters.stage}
        onChange={(stage) => onChange({ stage })}
      />
      <MultiFilter
        label="Modalidad"
        allLabel="Todas las modalidades"
        options={workModeOptions}
        value={filters.mode}
        onChange={(mode) => onChange({ mode })}
      />

      <Select
        items={sourceItems}
        value={
          filters.sourceId === null ? ALL_SOURCES : String(filters.sourceId)
        }
        onValueChange={(next) =>
          onChange({
            sourceId:
              next === null || next === ALL_SOURCES ? null : Number(next),
          })
        }
      >
        <SelectTrigger aria-label="Filtrar por fuente">
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
        <Button
          variant="ghost"
          onClick={() => {
            setClearCount((c) => c + 1)
            onClear()
          }}
        >
          <XIcon data-icon="inline-start" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}

export default JobApplicationFiltersBar
