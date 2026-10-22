import type { AsyncEvent, AsyncState } from "@/types/async-state.types"

export const initialAsyncState = <T>(): AsyncState<T> => ({ status: "loading" })

// Pure transition table for one data source. Events that make no sense in the
// current state are ignored and return the SAME state object (so React skips
// the re-render). `refresh*` events come from silent background refreshes.
export const asyncReducer = <T>(
  state: AsyncState<T>,
  event: AsyncEvent<T>
): AsyncState<T> => {
  switch (state.status) {
    case "loading":
      if (event.type === "loaded") return { status: "ready", data: event.data }
      if (event.type === "failed")
        return { status: "error", error: event.error }
      return state
    case "error":
      if (event.type === "retry") return { status: "loading" }
      if (event.type === "refreshSucceeded") {
        return { status: "ready", data: event.data }
      }
      if (event.type === "refreshFailed") {
        return { status: "error", error: event.error }
      }
      return state
    case "ready":
      if (event.type === "refreshSucceeded") {
        return { status: "ready", data: event.data }
      }
      return state
  }
}
