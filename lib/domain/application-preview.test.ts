import { describe, expect, it } from "vitest"
import { formatAppliedDate, previewInitial } from "@/lib/domain/application-preview"

const NOW = new Date(2026, 10, 4, 12)

describe("previewInitial", () => {
  it("uses the first letter of the company, in upper case", () => {
    expect(previewInitial("initech")).toBe("I")
  })

  it("ignores the spaces around the name", () => {
    expect(previewInitial("  nubia labs")).toBe("N")
  })

  it("falls back to E while the company is empty", () => {
    expect(previewInitial("   ")).toBe("E")
  })

  it("keeps a character outside the basic plane whole", () => {
    expect(previewInitial("𝒜cme")).toBe("𝒜")
  })
})

describe("formatAppliedDate", () => {
  it("shows today when no date was chosen", () => {
    expect(formatAppliedDate("", NOW)).toBe("Hoy, 4 nov 2026")
  })

  it("marks a chosen date that is today", () => {
    expect(formatAppliedDate(new Date(2026, 10, 4, 8), NOW)).toBe("Hoy, 4 nov 2026")
  })

  it("shows any other date in Spanish", () => {
    expect(formatAppliedDate(new Date(2026, 8, 30), NOW)).toBe("30 sep 2026")
  })
})
