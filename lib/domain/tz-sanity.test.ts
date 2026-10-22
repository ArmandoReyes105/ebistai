import { describe, expect, it } from "vitest"

// Fails fast when the runner ignores the TZ set by the npm scripts (cross-env).
describe("test runner time zone", () => {
  it("runs in America/Mexico_City", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
      "America/Mexico_City"
    )
  })

  it("applies a fixed UTC-6 offset", () => {
    expect(new Date("2026-10-21T12:00:00Z").getTimezoneOffset()).toBe(360)
  })
})
