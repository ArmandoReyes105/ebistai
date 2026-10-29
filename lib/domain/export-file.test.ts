import { describe, expect, it } from "vitest"
import { exportFileName } from "./export-file"

// Tests run with TZ=America/Mexico_City (UTC-6).
describe("exportFileName", () => {
  it("names the file with the local date", () => {
    expect(exportFileName(new Date("2026-10-29T18:00:00Z"))).toBe(
      "ebistai-aplicaciones-2026-10-29.xlsx"
    )
  })

  it("uses the local day, not the UTC day, late at night", () => {
    // 03:00 UTC on the 30th is still 21:00 on the 29th in Mexico City.
    expect(exportFileName(new Date("2026-10-30T03:00:00Z"))).toBe(
      "ebistai-aplicaciones-2026-10-29.xlsx"
    )
  })

  it("pads month and day", () => {
    expect(exportFileName(new Date("2026-02-05T18:00:00Z"))).toBe(
      "ebistai-aplicaciones-2026-02-05.xlsx"
    )
  })
})
