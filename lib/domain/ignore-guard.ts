// Pure decisions for "Marcar como ignorada". The hook owns the in-flight Set
// (a ref) and clears the id in a `finally`, whatever the outcome.

// A second click on the same row while its request is in flight is dropped.
export const canStartIgnore = (
  inFlight: ReadonlySet<string>,
  id: string
): boolean => !inFlight.has(id)

// `ok` is the boolean returned by changeStatus (it never rejects). The row is
// removed from local state only on success, until the refresh confirms it.
export const afterIgnore = (
  // Kept in the signature so callers pass the same context to both decisions.
  _inFlight: ReadonlySet<string>,
  _id: string,
  ok: boolean
): { removeRow: boolean } => ({ removeRow: ok })
