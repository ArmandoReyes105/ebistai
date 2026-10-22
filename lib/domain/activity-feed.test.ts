import { describe, expect, it } from "vitest"
import type { ActivityEvent } from "@/types/stats.types"
import { describeActivityEvent } from "./activity-feed"

const event = (overrides: Partial<ActivityEvent>): ActivityEvent => ({
  applicationId: "app-1",
  company: "Globex",
  jobTitle: "Platform Engineer",
  kind: "new",
  from: null,
  to: "Applied",
  occurredAt: "2026-10-20T12:00:00Z",
  actor: "User",
  ...overrides,
})

describe("describeActivityEvent", () => {
  it("new: creation text with the job title, filled marker", () => {
    expect(describeActivityEvent(event({ kind: "new" }))).toEqual({
      text: "aplicaste a Platform Engineer",
      marker: "new",
      automatic: false,
    })
  })

  it("stage: reads from/to as STAGE names with the shared stage labels", () => {
    expect(
      describeActivityEvent(
        event({ kind: "stage", from: "Applied", to: "TechnicalInterview" })
      )
    ).toEqual({
      text: "pasó de Aplicada a Entrevista técnica",
      marker: "advance",
      automatic: false,
    })
  })

  it("revive: reads from/to as STATUS names (never as stages)", () => {
    expect(
      describeActivityEvent(
        event({ kind: "revive", from: "Ignored", to: "Active" })
      )
    ).toEqual({
      text: "volvió a estar activa (antes: Ignorada)",
      marker: "advance",
      automatic: false,
    })
  })

  it("closed: reads the target as a STATUS name", () => {
    expect(
      describeActivityEvent(
        event({ kind: "closed", from: "Active", to: "Rejected" })
      )
    ).toEqual({
      text: "cerró el proceso: Rechazada",
      marker: "closed",
      automatic: false,
    })
  })

  it("closed by the System actor is labeled as automatic", () => {
    expect(
      describeActivityEvent(
        event({
          kind: "closed",
          from: "Active",
          to: "Ignored",
          actor: "System",
        })
      )
    ).toEqual({
      text: "Ignorada automáticamente",
      marker: "closed",
      automatic: true,
    })
  })

  it("flags any System event as automatic", () => {
    expect(
      describeActivityEvent(
        event({ kind: "stage", from: "Applied", to: "Offer", actor: "System" })
      ).automatic
    ).toBe(true)
  })

  it("falls back to the raw name instead of throwing on an unknown name", () => {
    expect(
      describeActivityEvent(
        event({ kind: "stage", from: "Applied", to: "Mystery" })
      ).text
    ).toBe("pasó de Aplicada a Mystery")
    expect(
      describeActivityEvent(
        event({ kind: "closed", from: "Active", to: "Mystery" })
      ).text
    ).toBe("cerró el proceso: Mystery")
  })

  it("stage without a from name still reads cleanly", () => {
    expect(
      describeActivityEvent(event({ kind: "stage", from: null, to: "Offer" }))
        .text
    ).toBe("pasó a Oferta")
  })
})
