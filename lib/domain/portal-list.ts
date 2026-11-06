import { normalizeCatalogName } from "@/lib/domain/catalog-name"
import { Status } from "@/types/enums"
import { Portal } from "@/types/portal.types"

export const splitApplications = (portal: Portal) => ({
  active: portal.applications.filter((a) => a.status === Status.Active),
  closed: portal.applications.filter((a) => a.status !== Status.Active),
})

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

export function formatPortalCounts(portal: Portal): string {
  if (portal.applications.length === 0) return "Sin postulaciones"

  const { active, closed } = splitApplications(portal)
  return `${plural(active.length, "activa")} · ${plural(closed.length, "cerrada")}`
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

// Names are unique per user, so a name identifies one portal.
export const findPortalByName = (portals: Portal[], name: string) => {
  const term = normalizeCatalogName(name)
  return term
    ? portals.find((portal) => normalizeCatalogName(portal.name) === term)
    : undefined
}
