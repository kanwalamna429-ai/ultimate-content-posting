"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { SearchFilter } from "@/components/layout/search-filter"
import { Pagination } from "@/components/layout/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type UrlEntry } from "@/lib/mock-data"
import { Plus, Copy, ExternalLink, MoreHorizontal, MousePointerClick, Link2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PAGE_SIZE = 5

export default function UrlLibraryPage() {
  const [urls, setUrls] = useState<UrlEntry[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage]   = useState(1)
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return urls
    const q = search.toLowerCase()
    return urls.filter(
      (u) =>
        u.title.toLowerCase().includes(q) ||
        u.originalUrl.toLowerCase().includes(q) ||
        u.shortUrl.toLowerCase().includes(q) ||
        u.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [urls, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function copyToClipboard(url: string, id: string) {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleDelete(id: string) {
    setUrls((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="URL Library" />

      <main className="flex-1 p-4 lg:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {urls.length === 0 ? "No URLs yet" : `${filtered.length} URL${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add URL
          </Button>
        </div>

        {urls.length > 0 && (
          <SearchFilter
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            onClear={() => { setSearch(""); setPage(1) }}
          />
        )}

        <div className="space-y-3">
          {urls.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No URLs in your library</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Add URLs to shorten and track. Assign them to campaigns to include in scheduled posts.
                  </p>
                </div>
                <Button size="sm" className="gap-1.5 mt-1">
                  <Plus className="h-4 w-4" />
                  Add your first URL
                </Button>
              </CardContent>
            </Card>
          ) : paginated.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                No URLs match your search.
              </CardContent>
            </Card>
          ) : (
            paginated.map((url) => (
              <Card key={url.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 lg:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm leading-none truncate max-w-xs">
                          {url.title}
                        </h3>
                        {url.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-primary hover:underline truncate max-w-[200px]"
                        >
                          {url.shortUrl}
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => copyToClipboard(url.shortUrl, url.id)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {copied === url.id && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">Copied!</span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground truncate max-w-sm">
                        {url.originalUrl}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" />
                          {url.clicks.toLocaleString()} clicks
                        </span>
                        <span>Added {url.createdAt}</span>
                        {url.campaigns.length > 0 && (
                          <span>Campaign: {url.campaigns.join(", ")}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={url.originalUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View analytics</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(url.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filtered.length > PAGE_SIZE && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
          />
        )}
      </main>
    </div>
  )
}
