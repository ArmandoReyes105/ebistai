import { Stage, Status, WorkMode } from "@/types/enums"

// Single place that maps the readable URL values of /job-applications to the
// numeric values of the API. Anything unknown is ignored (falls back to defaults).

export type StateFilter = "all" | "active" | "closed"
export type SortOption = "progress" | "applied" | "company"

export const PAGE_SIZES = [20, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 20

export interface JobApplicationFilters {
  state: StateFilter
  status: Status[]
  stage: Stage[]
  mode: WorkMode[]
  sourceId: number | null
  q: string
  sort: SortOption
  page: number
  pageSize: number
}

export const DEFAULT_FILTERS: JobApplicationFilters = {
  state: "all",
  status: [],
  stage: [],
  mode: [],
  sourceId: null,
  q: "",
  sort: "progress",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

const STATE_API: Record<StateFilter, number> = { all: 0, active: 1, closed: 2 }
const SORT_API: Record<SortOption, number> = {
  progress: 0,
  applied: 1,
  company: 2,
}

// Slug <-> enum tables. Array order is the canonical order used in the URL.
const STATUS_SLUGS: [string, Status][] = [
  ["active", Status.Active],
  ["rejected", Status.Rejected],
  ["withdrawn", Status.Withdrawn],
  ["offer-accepted", Status.OfferAccepted],
  ["ignored", Status.Ignored],
  ["offer-declined", Status.OfferDeclined],
  ["position-closed", Status.PositionClosed],
]
const STAGE_SLUGS: [string, Stage][] = [
  ["applied", Stage.Applied],
  ["interview", Stage.Interview],
  ["assessment", Stage.Assessment],
  ["technical-interview", Stage.TechnicalInterview],
  ["offer", Stage.Offer],
]
const MODE_SLUGS: [string, WorkMode][] = [
  ["remote", WorkMode.Remote],
  ["hybrid", WorkMode.Hybrid],
  ["on-site", WorkMode.OnSite],
]

const isOneOf = <T extends string>(
  value: string | null,
  allowed: readonly T[]
): value is T => value !== null && (allowed as readonly string[]).includes(value)

function parseList<T extends number>(
  raw: string | null,
  table: [string, T][]
): T[] {
  if (!raw) return []
  const slugs = new Set(raw.split(",").map((s) => s.trim()))
  return table.filter(([slug]) => slugs.has(slug)).map(([, value]) => value)
}

function formatList<T extends number>(
  values: T[],
  table: [string, T][]
): string {
  return table
    .filter(([, value]) => values.includes(value))
    .map(([slug]) => slug)
    .join(",")
}

function parsePositiveInt(raw: string | null): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null
  const n = Number(raw)
  return Number.isSafeInteger(n) && n > 0 ? n : null
}

export function parseFilters(params: URLSearchParams): JobApplicationFilters {
  const state = params.get("state")
  const sort = params.get("sort")
  const pageSize = parsePositiveInt(params.get("pageSize"))

  return {
    state: isOneOf(state, ["all", "active", "closed"] as const)
      ? state
      : DEFAULT_FILTERS.state,
    status: parseList(params.get("status"), STATUS_SLUGS),
    stage: parseList(params.get("stage"), STAGE_SLUGS),
    mode: parseList(params.get("mode"), MODE_SLUGS),
    sourceId: parsePositiveInt(params.get("source")),
    q: (params.get("q") ?? "").trim(),
    sort: isOneOf(sort, ["progress", "applied", "company"] as const)
      ? sort
      : DEFAULT_FILTERS.sort,
    page: parsePositiveInt(params.get("page")) ?? DEFAULT_FILTERS.page,
    pageSize: (PAGE_SIZES as readonly number[]).includes(pageSize ?? 0)
      ? (pageSize as number)
      : DEFAULT_PAGE_SIZE,
  }
}

// Only non-default values are written, so a clean URL means "no filters".
export function serializeFilters(filters: JobApplicationFilters): string {
  const params = new URLSearchParams()
  if (filters.state !== DEFAULT_FILTERS.state) params.set("state", filters.state)
  const status = formatList(filters.status, STATUS_SLUGS)
  if (status) params.set("status", status)
  const stage = formatList(filters.stage, STAGE_SLUGS)
  if (stage) params.set("stage", stage)
  const mode = formatList(filters.mode, MODE_SLUGS)
  if (mode) params.set("mode", mode)
  if (filters.sourceId !== null) params.set("source", String(filters.sourceId))
  if (filters.q) params.set("q", filters.q)
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort)
  if (filters.page > 1) params.set("page", String(filters.page))
  if (filters.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(filters.pageSize))
  }
  return params.toString()
}

// Query string for GET api/job-applications (numeric values, repeated params).
export function toApiQuery(filters: JobApplicationFilters): string {
  const params = new URLSearchParams()
  params.set("state", String(STATE_API[filters.state]))
  filters.status.forEach((v) => params.append("status", String(v)))
  filters.stage.forEach((v) => params.append("stage", String(v)))
  filters.mode.forEach((v) => params.append("mode", String(v)))
  if (filters.sourceId !== null) {
    params.set("sourceId", String(filters.sourceId))
  }
  if (filters.q) params.set("q", filters.q)
  params.set("sort", String(SORT_API[filters.sort]))
  params.set("page", String(filters.page))
  params.set("pageSize", String(filters.pageSize))
  return params.toString()
}

// True when something other than sort/page/pageSize narrows the list.
export function hasActiveFilters(filters: JobApplicationFilters): boolean {
  return (
    filters.state !== DEFAULT_FILTERS.state ||
    filters.status.length > 0 ||
    filters.stage.length > 0 ||
    filters.mode.length > 0 ||
    filters.sourceId !== null ||
    filters.q !== ""
  )
}

// Clears every narrowing filter but keeps the user's sort and page size.
export function clearFilters(
  filters: JobApplicationFilters
): JobApplicationFilters {
  return {
    ...DEFAULT_FILTERS,
    sort: filters.sort,
    pageSize: filters.pageSize,
  }
}
