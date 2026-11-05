import { describe, expect, it } from "vitest"
import { jobApplicationSchema, updateApplicationSchema } from "@/schemas/job-application"
import { WorkMode } from "@/types/enums"

const values = (notes: string) => ({
  jobTitle: "Software Engineer",
  company: "Acme",
  applicationSource: "LinkedIn",
  mode: WorkMode.Remote,
  notes,
})

describe.each([
  ["create", jobApplicationSchema],
  ["update", updateApplicationSchema],
])("%s form notes limit", (_, schema) => {
  it("accepts 4000 characters, the same limit as the MCP server", () => {
    expect(schema.safeParse(values("a".repeat(4000))).success).toBe(true)
  })

  it("rejects 4001 characters with the limit in the message", () => {
    const result = schema.safeParse(values("a".repeat(4001)))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("Máximo 4000 caracteres")
  })
})

describe.each([
  ["create", jobApplicationSchema],
  ["update", updateApplicationSchema],
])("%s form job posting URL limit", (_, schema) => {
  const url = (length: number) => "https://a.co/" + "a".repeat(length - "https://a.co/".length)

  it("accepts 500 characters, the same limit as the API", () => {
    const result = schema.safeParse({ ...values(""), jobPostingUrl: url(500) })

    expect(result.success).toBe(true)
  })

  it("rejects 501 characters", () => {
    const result = schema.safeParse({ ...values(""), jobPostingUrl: url(501) })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("La URL es demasiado larga")
  })
})

describe.each([
  ["create", jobApplicationSchema],
  ["update", updateApplicationSchema],
])("%s form job title limit", (_, schema) => {
  it("accepts 200 characters, the same limit as the MCP server", () => {
    const result = schema.safeParse({ ...values(""), jobTitle: "a".repeat(200) })

    expect(result.success).toBe(true)
  })

  it("rejects 201 characters", () => {
    const result = schema.safeParse({ ...values(""), jobTitle: "a".repeat(201) })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("El nombre del puesto es demasiado largo")
  })

  it("still requires at least 2 characters", () => {
    const result = schema.safeParse({ ...values(""), jobTitle: "a" })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("El puesto debe tener al menos 2 caracteres")
  })
})
