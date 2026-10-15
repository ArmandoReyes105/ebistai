import { FOLD_FROM, FOLD_TO } from "./catalog-name-fold"

// Hint-only twin of the server NameNormalizer.NormalizeName (ebistai-api
// Helpers/NameNormalizer.cs). Same steps, same table, ordinal and culture-free:
// no toUpperCase/toLowerCase/normalize. It is an approximation used to decide
// whether to show the "new name" hint and is never authoritative.

const N_TILDE_UPPER = String.fromCharCode(0x00d1)
const COMBINING_TILDE = 0x0303

const FOLD = new Map<string, string>()
for (let i = 0; i < FOLD_FROM.length; i++) FOLD.set(FOLD_FROM[i], FOLD_TO[i])

const isFormatChar = (code: number) =>
  code === 0x00ad ||
  (code >= 0x200b && code <= 0x200d) ||
  code === 0x2060 ||
  code === 0xfeff

const isWhitespace = (code: number) =>
  (code >= 0x0009 && code <= 0x000d) ||
  code === 0x0020 ||
  code === 0x0085 ||
  code === 0x00a0 ||
  code === 0x1680 ||
  (code >= 0x2000 && code <= 0x200a) ||
  code === 0x2028 ||
  code === 0x2029 ||
  code === 0x202f ||
  code === 0x205f ||
  code === 0x3000

// Format characters are skipped, so a combining mark may follow after them.
function nextVisible(s: string, from: number): number | null {
  for (let i = from; i < s.length; i++) {
    if (!isFormatChar(s.charCodeAt(i))) return i
  }
  return null
}

function collapseWhitespace(s: string): string {
  let out = ""
  let pendingSpace = false
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    if (isWhitespace(code)) {
      pendingSpace = out.length > 0
      continue
    }
    if (pendingSpace) {
      out += " "
      pendingSpace = false
    }
    out += s[i]
  }
  return out
}

export function normalizeCatalogName(name: string | null | undefined): string {
  if (!name) return ""

  let stripped = ""
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i)
    if (isFormatChar(code)) continue

    if (code === 0x4e || code === 0x6e) {
      const next = nextVisible(name, i + 1)
      if (next !== null && name.charCodeAt(next) === COMBINING_TILDE) {
        stripped += N_TILDE_UPPER
        i = next
        continue
      }
    }

    if (code >= 0x0300 && code <= 0x036f) continue

    stripped += name[i]
  }

  const collapsed = collapseWhitespace(stripped)
  if (collapsed.length === 0) return ""

  let result = ""
  for (let i = 0; i < collapsed.length; i++) {
    result += FOLD.get(collapsed[i]) ?? collapsed[i]
  }
  return result
}

// Mirrors CatalogVisibility.MinQueryLength on the server.
export const MIN_CATALOG_QUERY_LENGTH = 2

// True when `value` is long enough to matter and matches none of the visible
// suggestions once both sides are normalized.
export function isNewCatalogName(
  value: string,
  suggestions: readonly string[]
): boolean {
  const normalized = normalizeCatalogName(value)
  if (normalized.length < MIN_CATALOG_QUERY_LENGTH) return false
  return !suggestions.some((s) => normalizeCatalogName(s) === normalized)
}
