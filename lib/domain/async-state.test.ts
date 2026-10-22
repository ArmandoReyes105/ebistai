import { describe, expect, it } from "vitest"
import type { AsyncEvent, AsyncState } from "@/types/async-state.types"
import { asyncReducer, initialAsyncState } from "./async-state"

type S = AsyncState<string>
type E = AsyncEvent<string>

const loading: S = { status: "loading" }
const failure = new Error("boom")
const error: S = { status: "error", error: failure }
const ready: S = { status: "ready", data: "old" }

const loaded: E = { type: "loaded", data: "new" }
const failed: E = { type: "failed", error: "nope" }
const retry: E = { type: "retry" }
const refreshSucceeded: E = { type: "refreshSucceeded", data: "fresh" }
const refreshFailed: E = { type: "refreshFailed", error: "late" }

// Every (state, event) pair, 3 x 5 = 15 rows (JD3-3).
const matrix: [string, S, E, S][] = [
  ["loading + loaded", loading, loaded, { status: "ready", data: "new" }],
  ["loading + failed", loading, failed, { status: "error", error: "nope" }],
  ["loading + retry", loading, retry, loading],
  ["loading + refreshSucceeded (ignored)", loading, refreshSucceeded, loading],
  ["loading + refreshFailed (ignored)", loading, refreshFailed, loading],

  ["error + loaded (ignored)", error, loaded, error],
  ["error + failed (ignored)", error, failed, error],
  ["error + retry", error, retry, loading],
  [
    "error + refreshSucceeded",
    error,
    refreshSucceeded,
    { status: "ready", data: "fresh" },
  ],
  [
    "error + refreshFailed",
    error,
    refreshFailed,
    { status: "error", error: "late" },
  ],

  ["ready + loaded (ignored)", ready, loaded, ready],
  ["ready + failed (ignored)", ready, failed, ready],
  ["ready + retry (ignored)", ready, retry, ready],
  [
    "ready + refreshSucceeded",
    ready,
    refreshSucceeded,
    { status: "ready", data: "fresh" },
  ],
  ["ready + refreshFailed (keeps data)", ready, refreshFailed, ready],
]

describe("asyncReducer", () => {
  it.each(matrix)("%s", (_name, state, event, expected) => {
    expect(asyncReducer(state, event)).toEqual(expected)
  })

  it("covers the full matrix", () => {
    expect(matrix).toHaveLength(15)
  })

  it("keeps the same object when the event is ignored", () => {
    expect(asyncReducer(ready, refreshFailed)).toBe(ready)
    expect(asyncReducer(loading, refreshSucceeded)).toBe(loading)
    expect(asyncReducer(error, loaded)).toBe(error)
  })

  it("starts in loading", () => {
    expect(initialAsyncState()).toEqual({ status: "loading" })
  })
})
