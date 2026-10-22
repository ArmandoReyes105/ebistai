// Status of one data source on a screen. Each source has its own state so one
// failure never takes the others down.
export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; data: T }

// Events that drive an AsyncState (see lib/domain/async-state.ts).
export type AsyncEvent<T> =
  | { type: "loaded"; data: T }
  | { type: "failed"; error: unknown }
  | { type: "retry" }
  | { type: "refreshSucceeded"; data: T }
  | { type: "refreshFailed"; error: unknown }
