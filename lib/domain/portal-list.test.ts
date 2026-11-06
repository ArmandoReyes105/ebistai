import { describe, expect, it } from "vitest"
import {
  filterPortals,
  findPortalByName,
  formatPortalCounts,
  sortPortals,
  splitApplications,
} from "@/lib/domain/portal-list"
import { Stage, Status } from "@/types/enums"
import { Portal, PortalApplication } from "@/types/portal.types"

const application = (status: Status): PortalApplication => ({
  id: `${status}`,
  jobTitle: "Backend",
  company: "Acme",
  status,
  stage: Stage.Applied,
})

const portal = (name: string, statuses: Status[] = []): Portal => ({
  id: name,
  name,
  url: `https://${name}.example`,
  applications: statuses.map(application),
})

describe("splitApplications", () => {
  it("separates the active applications from every closed status", () => {
    const { active, closed } = splitApplications(
      portal("a", [
        Status.Active,
        Status.Rejected,
        Status.Ignored,
        Status.Withdrawn,
      ])
    )

    expect(active.map((a) => a.status)).toEqual([Status.Active])
    expect(closed.map((a) => a.status)).toEqual([
      Status.Rejected,
      Status.Ignored,
      Status.Withdrawn,
    ])
  })
})

describe("formatPortalCounts", () => {
  it("shows both counts", () => {
    expect(
      formatPortalCounts(portal("a", [Status.Active, Status.Rejected]))
    ).toBe("1 activa · 1 cerrada")
  })

  it("keeps the zero, so a dead portal reads as one", () => {
    expect(
      formatPortalCounts(
        portal("a", [Status.Rejected, Status.Ignored, Status.Withdrawn])
      )
    ).toBe("0 activas · 3 cerradas")
  })

  it("explains a portal without applications", () => {
    expect(formatPortalCounts(portal("a"))).toBe("Sin postulaciones")
  })
})

describe("sortPortals", () => {
  it("puts portals with active applications first, then by name", () => {
    const sorted = sortPortals([
      portal("Zeta", [Status.Active]),
      portal("Beta", [Status.Rejected]),
      portal("Alfa"),
      portal("Delta", [Status.Active]),
    ])

    expect(sorted.map((p) => p.name)).toEqual(["Delta", "Zeta", "Alfa", "Beta"])
  })

  it("does not change the list it receives", () => {
    const portals = [portal("Zeta"), portal("Alfa")]

    sortPortals(portals)

    expect(portals.map((p) => p.name)).toEqual(["Zeta", "Alfa"])
  })
})

describe("filterPortals", () => {
  const portals = [portal("Peñoles"), portal("Acme Corp")]

  it("returns every portal for a blank search", () => {
    expect(filterPortals(portals, "   ")).toHaveLength(2)
  })

  it.each(["acme", "ACME", " corp "])("finds by part of the name: %j", (q) => {
    expect(filterPortals(portals, q).map((p) => p.name)).toEqual(["Acme Corp"])
  })

  it("ignores accents", () => {
    expect(filterPortals([portal("Telefónica")], "telefonica")).toHaveLength(1)
  })

  it("returns nothing when no name matches", () => {
    expect(filterPortals(portals, "nada")).toEqual([])
  })
})

describe("findPortalByName", () => {
  const portals = [portal("Acme Corp"), portal("Telefónica")]

  it("finds the portal ignoring case, accents and outer spaces", () => {
    expect(findPortalByName(portals, " acme corp ")?.name).toBe("Acme Corp")
    expect(findPortalByName(portals, "TELEFONICA")?.name).toBe("Telefónica")
  })

  it("needs the whole name, so a partial search links nothing", () => {
    expect(findPortalByName(portals, "Acme")).toBeUndefined()
  })

  it("finds nothing for a blank name", () => {
    expect(findPortalByName(portals, "  ")).toBeUndefined()
  })
})
