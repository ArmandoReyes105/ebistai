import { normalizeCatalogName } from "@/lib/domain/catalog-name"
import { Status } from "@/types/enums"
import { Portal } from "@/types/portal.types"

export const splitApplications = (portal: Portal) => ({
  active: portal.applications.filter((a) => a.status === Status.Active),
  closed: portal.applications.filter((a) => a.status !== Status.Active),
})

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

export function portalCounts(portal: Portal) {
  const { active, closed } = splitApplications(portal)

  return {
    active: active.length,
    activeWord: active.length === 1 ? "activa" : "activas",
    closed: closed.length > 0 ? plural(closed.length, "cerrada") : null,
  }
}

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
