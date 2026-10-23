import { describe, expect, it } from "vitest"
import {
  THRESHOLD_OPTIONS,
  autoIgnoreLabel,
  avatarInitial,
  radioTargetIndex,
  rulerPercent,
  themeChoiceOf,
} from "./config-settings"

describe("rulerPercent", () => {
  it("positions each option proportionally to the longest one", () => {
    expect(THRESHOLD_OPTIONS.map((days) => rulerPercent(days))).toEqual([
      31.1, 46.7, 55.6, 66.7, 100,
    ])
  })

  it("clamps to 0..100", () => {
    expect(rulerPercent(90)).toBe(100)
    expect(rulerPercent(-3)).toBe(0)
  })

  it("is 0 when there are no options to scale against", () => {
    expect(rulerPercent(14, [])).toBe(0)
  })
})

describe("radioTargetIndex", () => {
  it("moves forward and wraps around with ArrowRight / ArrowDown", () => {
    expect(radioTargetIndex(0, "ArrowRight", 5)).toBe(1)
    expect(radioTargetIndex(4, "ArrowDown", 5)).toBe(0)
  })

  it("moves backward and wraps around with ArrowLeft / ArrowUp", () => {
    expect(radioTargetIndex(2, "ArrowLeft", 5)).toBe(1)
    expect(radioTargetIndex(0, "ArrowUp", 5)).toBe(4)
  })

  it("jumps to the ends with Home / End", () => {
    expect(radioTargetIndex(3, "Home", 5)).toBe(0)
    expect(radioTargetIndex(1, "End", 5)).toBe(4)
  })

  it("ignores other keys and empty groups", () => {
    expect(radioTargetIndex(1, "Tab", 5)).toBeNull()
    expect(radioTargetIndex(0, "ArrowRight", 0)).toBeNull()
  })
})

describe("autoIgnoreLabel", () => {
  it("names the switch state", () => {
    expect(autoIgnoreLabel(true)).toBe("Encendido")
    expect(autoIgnoreLabel(false)).toBe("Apagado")
  })
})

describe("themeChoiceOf", () => {
  it("keeps the three known choices", () => {
    expect(themeChoiceOf("light")).toBe("light")
    expect(themeChoiceOf("dark")).toBe("dark")
    expect(themeChoiceOf("system")).toBe("system")
  })

  it("falls back to system for unknown or missing values", () => {
    expect(themeChoiceOf(undefined)).toBe("system")
    expect(themeChoiceOf("sepia")).toBe("system")
  })
})

describe("avatarInitial", () => {
  it("uses the first letter of the name, uppercased", () => {
    expect(avatarInitial("jax", "a@b.c")).toBe("J")
  })

  it("falls back to the email, then to a placeholder", () => {
    expect(avatarInitial("  ", "ana@b.c")).toBe("A")
    expect(avatarInitial(null, undefined)).toBe("?")
  })
})
