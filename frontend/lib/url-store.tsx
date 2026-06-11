"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { type UrlEntry } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UrlStore {
  urls: UrlEntry[]
  loading: boolean
  addUrls: (entries: UrlEntry[]) => Promise<void>
  removeUrl: (id: string) => Promise<void>
  clearAll: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const UrlStoreContext = createContext<UrlStore | null>(null)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a Supabase browser client, or null if credentials are missing. */
function tryGetClient() {
  try {
    // Dynamic require avoids a hard crash at module load when env vars are absent
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@/lib/supabase/client")
    return createClient() as ReturnType<typeof import("@/lib/supabase/client").createClient>
  } catch {
    return null
  }
}

/** Map a campaign_urls DB row → UrlEntry */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEntry(row: any): UrlEntry {
  return {
    id:          row.id,
    title:       row.title,
    originalUrl: row.original_url,
    shortUrl:    row.short_url ?? row.original_url,
    clicks:      row.clicks ?? 0,
    campaigns:   [],
    createdAt:   new Date(row.created_at).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
    tags: row.tags ?? [],
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function UrlStoreProvider({ children }: { children: ReactNode }) {
  const [urls, setUrls]       = useState<UrlEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Load existing URLs from Supabase on mount
  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = tryGetClient()
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || cancelled) { setLoading(false); return }

        const { data, error } = await supabase
          .from("campaign_urls")
          .select("id, title, original_url, short_url, clicks, tags, created_at")
          .eq("user_id", user.id)
          .is("campaign_id", null)       // library URLs have no campaign
          .is("deleted_at", null)
          .order("created_at", { ascending: false })

        if (error) throw error
        if (!cancelled) setUrls((data ?? []).map(rowToEntry))
      } catch (err) {
        console.error("[url-store] load failed:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  // ------------------------------------------------------------------
  // addUrls — write to Supabase, update local state
  // ------------------------------------------------------------------
  const addUrls = useCallback(async (entries: UrlEntry[]) => {
    const supabase = tryGetClient()

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const rows = entries.map((e) => ({
            id:           e.id,
            user_id:      user.id,
            campaign_id:  null,
            title:        e.title,
            original_url: e.originalUrl,
            // slug must be unique; use first 12 chars of UUID
            slug:         e.id.replace(/-/g, "").slice(0, 12),
            short_url:    null,          // no real shortener yet
            clicks:       0,
            tags:         e.tags,
            is_active:    true,
          }))

          const { error } = await supabase.from("campaign_urls").insert(rows)
          if (error) console.error("[url-store] insert failed:", error.message)
        }
      } catch (err) {
        console.error("[url-store] addUrls failed:", err)
      }
    }

    // Always update local state regardless of DB outcome
    setUrls((prev) => [...entries, ...prev])
  }, [])

  // ------------------------------------------------------------------
  // removeUrl — soft-delete in Supabase, remove from local state
  // ------------------------------------------------------------------
  const removeUrl = useCallback(async (id: string) => {
    const supabase = tryGetClient()

    if (supabase) {
      try {
        const { error } = await supabase
          .from("campaign_urls")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id)
        if (error) console.error("[url-store] remove failed:", error.message)
      } catch (err) {
        console.error("[url-store] removeUrl failed:", err)
      }
    }

    setUrls((prev) => prev.filter((u) => u.id !== id))
  }, [])

  // ------------------------------------------------------------------
  // clearAll — soft-delete all library URLs for this user
  // ------------------------------------------------------------------
  const clearAll = useCallback(async () => {
    const supabase = tryGetClient()

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { error } = await supabase
            .from("campaign_urls")
            .update({ deleted_at: new Date().toISOString() })
            .eq("user_id", user.id)
            .is("campaign_id", null)
            .is("deleted_at", null)
          if (error) console.error("[url-store] clearAll failed:", error.message)
        }
      } catch (err) {
        console.error("[url-store] clearAll failed:", err)
      }
    }

    setUrls([])
  }, [])

  return (
    <UrlStoreContext.Provider value={{ urls, loading, addUrls, removeUrl, clearAll }}>
      {children}
    </UrlStoreContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUrlStore() {
  const ctx = useContext(UrlStoreContext)
  if (!ctx) throw new Error("useUrlStore must be used within UrlStoreProvider")
  return ctx
}
