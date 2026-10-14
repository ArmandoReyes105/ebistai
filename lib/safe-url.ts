// Returns the URL only when it is an absolute http(s) URL; anything else
// (javascript:, data:, relative paths...) must never become an href.
export function safeHttpUrl(value?: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null
  } catch {
    return null
  }
}
