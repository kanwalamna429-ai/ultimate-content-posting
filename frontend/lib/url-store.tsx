"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type UrlEntry } from "@/lib/mock-data"

interface UrlStore {
  urls: UrlEntry[]
  addUrls: (entries: UrlEntry[]) => void
  removeUrl: (id: string) => void
  clearAll: () => void
}

const UrlStoreContext = createContext<UrlStore | null>(null)

export function UrlStoreProvider({ children }: { children: ReactNode }) {
  const [urls, setUrls] = useState<UrlEntry[]>([])

  const addUrls = useCallback((entries: UrlEntry[]) => {
    setUrls((prev) => [...entries, ...prev])
  }, [])

  const removeUrl = useCallback((id: string) => {
    setUrls((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setUrls([])
  }, [])

  return (
    <UrlStoreContext.Provider value={{ urls, addUrls, removeUrl, clearAll }}>
      {children}
    </UrlStoreContext.Provider>
  )
}

export function useUrlStore() {
  const ctx = useContext(UrlStoreContext)
  if (!ctx) throw new Error("useUrlStore must be used within UrlStoreProvider")
  return ctx
}
