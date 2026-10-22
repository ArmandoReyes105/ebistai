import { describe, expect, it } from "vitest"
import { Stage, Status } from "@/types/enums"
import { stageFromName, statusFromName } from "./stage-flow"

// Names and values as declared by the API (ebistai-api Enums/Stage.cs and
// Enums/ApplicationStatus.cs). If the API adds or renames one, update here and
// in types/enums.ts together.
const API_STAGES: [string, number][] = [
  ["Applied", 1],
  ["Interview", 2],
  ["TechnicalInterview", 3],
  ["Offer", 4],
  ["Assessment", 5],
]

const API_STATUSES: [string, number][] = [
  ["Active", 1],
  ["Rejected", 2],
  ["Withdrawn", 3],
  ["OfferAccepted", 4],
  ["Ignored", 5],
  ["OfferDeclined", 6],
  ["PositionClosed", 7],
]

describe("stageFromName", () => {
  it("maps Assessment to Stage.Assessment", () => {
    expect(stageFromName("Assessment")).toBe(Stage.Assessment)
  })

  it.each(API_STAGES)(
    "maps API stage %s to its front value %i",
    (name, value) => {
      expect(stageFromName(name)).toBe(value)
    }
  )

  it("covers every front Stage member", () => {
    const frontNames = Object.keys(Stage).filter((key) => isNaN(Number(key)))
    expect(frontNames.sort()).toEqual(API_STAGES.map(([name]) => name).sort())
  })

  it("throws on an unknown name", () => {
    expect(() => stageFromName("Hired")).toThrow(/Hired/)
    expect(() => stageFromName("")).toThrow()
  })

  it("is case sensitive", () => {
    expect(() => stageFromName("applied")).toThrow()
  })

  it("rejects numeric strings and inherited keys", () => {
    // Numeric enums also expose reverse keys ("1" -> "Applied").
    expect(() => stageFromName("1")).toThrow()
    expect(() => stageFromName("toString")).toThrow()
  })
})

describe("statusFromName", () => {
  it.each(API_STATUSES)(
    "maps API status %s to its front value %i",
    (name, value) => {
      expect(statusFromName(name)).toBe(value)
    }
  )

  it("maps the statuses used by the revive and closed feed kinds", () => {
    expect(statusFromName("Ignored")).toBe(Status.Ignored)
    expect(statusFromName("Active")).toBe(Status.Active)
    expect(statusFromName("Rejected")).toBe(Status.Rejected)
  })

  it("covers every front Status member", () => {
    const frontNames = Object.keys(Status).filter((key) => isNaN(Number(key)))
    expect(frontNames.sort()).toEqual(API_STATUSES.map(([name]) => name).sort())
  })

  it("throws on an unknown name", () => {
    expect(() => statusFromName("Hired")).toThrow(/Hired/)
    expect(() => statusFromName("")).toThrow()
  })

  it("rejects numeric strings and inherited keys", () => {
    expect(() => statusFromName("5")).toThrow()
    expect(() => statusFromName("constructor")).toThrow()
  })
})
