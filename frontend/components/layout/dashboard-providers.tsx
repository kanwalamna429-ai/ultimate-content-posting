"use client"

import { UrlStoreProvider } from "@/lib/url-store"
import { type ReactNode } from "react"

export function DashboardProviders({ children }: { children: ReactNode }) {
  return <UrlStoreProvider>{children}</UrlStoreProvider>
}
