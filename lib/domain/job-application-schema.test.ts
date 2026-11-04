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
