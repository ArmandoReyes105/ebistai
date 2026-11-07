import { normalizeCatalogName } from "@/lib/domain/catalog-name"
import { Status } from "@/types/enums"
import { Portal } from "@/types/portal.types"

// Shown wherever a portal is saved, before the user types anything sensitive.
export const PORTAL_ACCESS_WARNING =
  "Por seguridad, no escribas ni pegues tus datos de acceso. Guarda solo el portal."

export const splitApplications = (portal: Portal) => ({
  active: portal.applications.filter((a) => a.status === Status.Active),
  closed: portal.applications.filter((a) => a.status !== Status.Active),
})

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

export function portalCounts(portal: Portal) {
  const { active, closed } = splitApplications(portal)

  return {
    active: plural(active.length, "activa"),
    closed: plural(closed.length, "cerrada"),
    hasActive: active.length > 0,
  }
}

// The tags of the preview band; a new portal has no applications yet.
export function portalTags(portal?: Portal): string[] {
  if (!portal || portal.applications.length === 0) return ["Sin postulaciones"]

  const { active, closed } = portalCounts(portal)
  return [active, closed]
}

// The site of a link, even half typed. Best effort: it hides a "user:pass@"
// prefix in the preview; the API is what rejects links with credentials.
export const portalHost = (url: string): string =>
  url
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^.*@/, "")

const hasActive = (portal: Portal) =>
  splitApplications(portal).active.length > 0

// Portals still in use first; the rest sink to the bottom.
export const sortPortals = (portals: Portal[]): Portal[] =>
  [...portals].sort(
    (a, b) =>
      Number(hasActive(b)) - Number(hasActive(a)) ||
      a.name.localeCompare(b.name, "es")
  )

export function filterPortals(portals: Portal[], search: string): Portal[] {
  const term = normalizeCatalogName(search)
  if (!term) return portals

  return portals.filter((portal) =>
    normalizeCatalogName(portal.name).includes(term)
  )
}

export const NO_PORTAL = "Sin portal"

// Names are unique per user, so a name identifies one portal.
export const findPortalByName = (portals: Portal[], name: string) => {
  const term = normalizeCatalogName(name)
  return term
    ? portals.find((portal) => normalizeCatalogName(portal.name) === term)
    : undefined
}

// A portal the user named like the option wins, so it stays reachable.
export const portalSearchItems = (portals: Portal[]): string[] => {
  const names = portals.map((portal) => portal.name)
  return findPortalByName(portals, NO_PORTAL) ? names : [NO_PORTAL, ...names]
}

// What a value of the search means: the text to show and the portal to link.
export function resolvePortalSearch(portals: Portal[], value: string) {
  const portal = findPortalByName(portals, value)
  if (portal) return { search: value, portalId: portal.id }

  return { search: value === NO_PORTAL ? "" : value, portalId: "" }
}
