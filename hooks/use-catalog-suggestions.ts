"use client"

import {
  MIN_CATALOG_QUERY_LENGTH,
  normalizeCatalogName,
} from "@/lib/domain/catalog-name"
import { catalogService } from "@/services/catalog-service"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export type CatalogKind = "companies" | "sources"

const DEBOUNCE_MS = 250
const NO_ITEMS: string[] = []

interface Debounced {
  text: string
  seq: number
}

interface Result {
  seq: number
  items: string[]
  status: "ok" | "error"
}

// Suggestions for a free-text catalog field. Every debounced change gets a new
// `seq`, and a result only counts when its `seq` matches the current one, so a
// stale or aborted response can never show (or leave a hint behind).
export function useCatalogSuggestions(kind: CatalogKind, value: string) {
  const { getToken } = useAuth()
  const [debounced, setDebounced] = useState<Debounced>({
    text: value,
    seq: 0,
  })
  const [result, setResult] = useState<Result>()

  useEffect(() => {
    const timer = setTimeout(
      () =>
        setDebounced((prev) =>
          prev.text === value ? prev : { text: value, seq: prev.seq + 1 }
        ),
      DEBOUNCE_MS
    )
    return () => clearTimeout(timer)
  }, [value])

  const { text, seq } = debounced
  const enabled = normalizeCatalogName(text).length >= MIN_CATALOG_QUERY_LENGTH

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    const load = async () => {
      try {
        const token = await getToken()
        const fetchSuggestions =
          kind === "companies"
            ? catalogService.getCompanies
            : catalogService.getSources
        const items = await fetchSuggestions(text, {
          token: token ?? undefined,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setResult({ seq, items: items ?? [], status: "ok" })
      } catch (error) {
        if (controller.signal.aborted) return
        console.error(error)
        setResult({ seq, items: [], status: "error" })
      }
    }
    void load()

    return () => controller.abort()
  }, [kind, enabled, seq, text, getToken])

  const current = enabled && result?.seq === seq ? result : undefined
  const items = current?.status === "ok" ? current.items : NO_ITEMS
  const isSettled = current?.status === "ok" && value.trim() === text.trim()

  return { items, isSettled }
}
