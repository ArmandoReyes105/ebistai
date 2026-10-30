import { describe, expect, it } from "vitest"

import { poseViewBox } from "./frame"
import { TAI_VIEW_BOX } from "./poses"

const parse = (box: string) => box.split(" ").map(Number)

describe("poseViewBox", () => {
  it("fits the posed fish plus the margin", () => {
    const [x, y, w, h] = parse(poseViewBox("neutral", 0))
    const [ux, uy, uw, uh] = parse(TAI_VIEW_BOX)
    expect(w).toBeGreaterThan(100)
    expect(h).toBeGreaterThan(100)
    // Tighter than the shared frame on every side.
    expect(x).toBeGreaterThan(ux)
    expect(y).toBeGreaterThan(uy)
    expect(x + w).toBeLessThan(ux + uw)
    expect(y + h).toBeLessThan(uy + uh)
  })

  it("grows by the margin on every side", () => {
    const [x, y, w, h] = parse(poseViewBox("neutral", 0))
    const [mx, my, mw, mh] = parse(poseViewBox("neutral", 4))
    expect(mx).toBeCloseTo(x - 4)
    expect(my).toBeCloseTo(y - 4)
    expect(mw).toBeCloseTo(w + 8)
    expect(mh).toBeCloseTo(h + 8)
  })
})
