import { describe, expect, it } from "vitest"

import { taiPoseFor } from "./tai-pose"

describe("taiPoseFor", () => {
  it("sleeps when the process is closed, however many days passed", () => {
    expect(taiPoseFor({ closed: true, days: 0, threshold: 14 })).toBe("sleep")
    expect(taiPoseFor({ closed: true, days: 40, threshold: 14 })).toBe("sleep")
  })

  it("is cold once an open process reaches the threshold", () => {
    expect(taiPoseFor({ closed: false, days: 14, threshold: 14 })).toBe("cold")
    expect(taiPoseFor({ closed: false, days: 30, threshold: 14 })).toBe("cold")
  })

  it("is neutral while progress is recent", () => {
    expect(taiPoseFor({ closed: false, days: 0, threshold: 14 })).toBe(
      "neutral"
    )
    expect(taiPoseFor({ closed: false, days: 13, threshold: 14 })).toBe(
      "neutral"
    )
  })
})
