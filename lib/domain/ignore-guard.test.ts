import { describe, expect, it } from "vitest"
import { afterIgnore, canStartIgnore } from "./ignore-guard"

describe("canStartIgnore", () => {
  it("allows the first click", () => {
    expect(canStartIgnore(new Set(), "a")).toBe(true)
  })

  it("blocks a second click while the same id is in flight", () => {
    expect(canStartIgnore(new Set(["a"]), "a")).toBe(false)
  })

  it("allows another id while one is in flight", () => {
    expect(canStartIgnore(new Set(["a"]), "b")).toBe(true)
  })
})

describe("afterIgnore", () => {
  it("keeps the row when the change failed", () => {
    expect(afterIgnore(new Set(["a"]), "a", false)).toEqual({
      removeRow: false,
    })
  })

  it("removes the row when the change succeeded", () => {
    expect(afterIgnore(new Set(["a"]), "a", true)).toEqual({ removeRow: true })
  })

  it("returns only removeRow (the hook clears the ref in a finally)", () => {
    expect(Object.keys(afterIgnore(new Set(["a"]), "a", true))).toEqual([
      "removeRow",
    ])
  })
})
