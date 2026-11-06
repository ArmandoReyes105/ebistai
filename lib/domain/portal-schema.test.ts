import { describe, expect, it } from "vitest"
import { getErrorMessage } from "@/lib/api/error-messages"
import { ApiError } from "@/lib/api/errors"
import { jobApplicationSchema } from "@/schemas/job-application"
import { PORTAL_NOTES_MAX_LENGTH, portalSchema } from "@/schemas/portal"
import { WorkMode } from "@/types/enums"

const values = {
  name: "Banamex",
  url: "https://banamex.example/candidate",
  notes: "",
}

const url = (length: number) =>
  "https://a.co/" + "a".repeat(length - "https://a.co/".length)

describe("portal form", () => {
  it("accepts a name and an http or https URL, with notes optional", () => {
    expect(portalSchema.safeParse(values).success).toBe(true)
    expect(
      portalSchema.safeParse({ name: "Banamex", url: "http://a.co" }).success
    ).toBe(true)
  })

  it("requires a name that is not blank", () => {
    const result = portalSchema.safeParse({ ...values, name: "   " })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("Escribe el nombre del portal")
  })

  it("accepts 200 characters in the name and rejects 201, like the API", () => {
    expect(
      portalSchema.safeParse({ ...values, name: "a".repeat(200) }).success
    ).toBe(true)
    expect(
      portalSchema.safeParse({ ...values, name: "a".repeat(201) }).success
    ).toBe(false)
  })

  it.each(["", "javascript:alert(1)", "ftp://a.co", "a.co/login"])(
    "rejects %j as URL",
    (value) => {
      const result = portalSchema.safeParse({ ...values, url: value })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(
        "Ingresa una URL válida (http o https)"
      )
    }
  )

  it("accepts a 500-character URL and rejects 501, like the API", () => {
    expect(portalSchema.safeParse({ ...values, url: url(500) }).success).toBe(
      true
    )
    expect(portalSchema.safeParse({ ...values, url: url(501) }).success).toBe(
      false
    )
  })

  it("limits the notes to 4000 characters, like the API", () => {
    expect(PORTAL_NOTES_MAX_LENGTH).toBe(4000)
    expect(
      portalSchema.safeParse({ ...values, notes: "a".repeat(4000) }).success
    ).toBe(true)
    expect(
      portalSchema.safeParse({ ...values, notes: "a".repeat(4001) }).success
    ).toBe(false)
  })
})

describe("application form portal", () => {
  const application = {
    jobTitle: "Software Engineer",
    company: "Acme",
    applicationSource: "LinkedIn",
    mode: WorkMode.Remote,
  }

  it("keeps the portal id and stays optional", () => {
    const portalId = "6f9619ff-8b86-4d01-b42d-00cf4fc964ff"

    expect(
      jobApplicationSchema.parse({ ...application, portalId }).portalId
    ).toBe(portalId)
    expect(jobApplicationSchema.safeParse(application).success).toBe(true)
    expect(
      jobApplicationSchema.safeParse({ ...application, portalId: "" }).success
    ).toBe(true)
  })
})

describe("portal error messages", () => {
  it.each([
    ["portal_url_conflict", 409, "Ya tienes un portal con ese enlace."],
    ["portal_not_found", 422, "Ese portal ya no existe. Elige otro."],
    ["invalid_portal_url", 422, "El enlace del portal debe empezar con http:// o https://."],
  ])("explains %s", (code, status, message) => {
    const error = new ApiError(status, "Error", { code })

    expect(getErrorMessage(error, "fallback")).toBe(message)
  })
})
