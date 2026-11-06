import { describe, expect, it } from "vitest"
import {
  filterPortals,
  findPortalByName,
  NO_PORTAL,
  portalCounts,
  portalSearchItems,
  resolvePortalSearch,
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

describe("portalCounts", () => {
  it("separates the active count from the closed text", () => {
    expect(portalCounts(portal("a", [Status.Active, Status.Rejected]))).toEqual(
      { active: 1, activeWord: "activa", closed: "1 cerrada" }
    )
  })

  it("keeps the zero, so a dead portal reads as one", () => {
    expect(
      portalCounts(
        portal("a", [Status.Rejected, Status.Ignored, Status.Withdrawn])
      )
    ).toEqual({ active: 0, activeWord: "activas", closed: "3 cerradas" })
  })

  it("leaves the closed text out when nothing closed", () => {
    expect(portalCounts(portal("a", [Status.Active, Status.Active]))).toEqual({
      active: 2,
      activeWord: "activas",
      closed: null,
    })
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

describe("portalSearchItems", () => {
  it("offers no portal first, then the portals", () => {
    expect(portalSearchItems([portal("Acme"), portal("Zeta")])).toEqual([
      NO_PORTAL,
      "Acme",
      "Zeta",
    ])
  })

  it("still offers it when there are no portals", () => {
    expect(portalSearchItems([])).toEqual([NO_PORTAL])
  })

  it("does not repeat a portal the user named the same", () => {
    expect(portalSearchItems([portal(NO_PORTAL)])).toEqual([NO_PORTAL])
  })
})

describe("resolvePortalSearch", () => {
  const portals = [portal("Acme")]

  it("clears the search and the link when choosing no portal", () => {
    expect(resolvePortalSearch(portals, NO_PORTAL)).toEqual({
      search: "",
      portalId: "",
    })
  })

  it("links the portal with that name", () => {
    expect(resolvePortalSearch(portals, "Acme")).toEqual({
      search: "Acme",
      portalId: "Acme",
    })
  })

  it("keeps the text but links nothing while it matches no portal", () => {
    expect(resolvePortalSearch(portals, "Ac")).toEqual({
      search: "Ac",
      portalId: "",
    })
  })

  it("links a portal the user named like the option", () => {
    expect(resolvePortalSearch([portal(NO_PORTAL)], NO_PORTAL)).toEqual({
      search: NO_PORTAL,
      portalId: NO_PORTAL,
    })
  })
})
