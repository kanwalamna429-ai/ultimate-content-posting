import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Megaphone,
  Play,
  Calendar,
  CheckCircle2,
  XCircle,
  Plug2,
  TrendingUp,
  Zap,
  AlertTriangle,
  RefreshCw,
  Activity,
} from "lucide-react"

const statCards = [
  {
    title: "Total Campaigns",
    value: "—",
    icon: Megaphone,
    description: "All time",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    title: "Active Campaigns",
    value: "—",
    icon: Play,
    description: "Currently running",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    title: "Scheduled Posts",
    value: "—",
    icon: Calendar,
    description: "Queued up",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    title: "Published Posts",
    value: "—",
    icon: CheckCircle2,
    description: "Successfully sent",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    title: "Failed Posts",
    value: "—",
    icon: XCircle,
    description: "Need attention",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
  {
    title: "Connected Platforms",
    value: "—",
    icon: Plug2,
    description: "Active integrations",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
  },
  {
    title: "Success Rate",
    value: "—",
    icon: TrendingUp,
    description: "Last 30 days",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40",
  },
]

// System health items — statically rendered, updated when Supabase is wired up
const systemHealthItems = [
  {
    label: "Publishing Engine",
    status: "idle",
    description: "No posts due",
    icon: Zap,
    color: "text-muted-foreground",
    dot: "bg-muted-foreground/40",
  },
  {
    label: "Edge Function",
    status: "unconfigured",
    description: "Set NEXTJS_SITE_URL to activate",
    icon: Activity,
    color: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  {
    label: "Platform Connections",
    status: "none",
    description: "No platforms connected",
    icon: Plug2,
    color: "text-muted-foreground",
    dot: "bg-muted-foreground/40",
  },
  {
    label: "Failed Posts",
    status: "ok",
    description: "No failures",
    icon: AlertTriangle,
    color: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  {
    label: "Retry Backlog",
    status: "ok",
    description: "Queue empty",
    icon: RefreshCw,
    color: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
]

const gettingStartedSteps = [
  {
    step: 1,
    title: "Connect a platform",
    description: "Go to Connections and add your first social or publishing account.",
    href: "/connections",
    done: false,
  },
  {
    step: 2,
    title: "Add URLs to publish",
    description: "Paste URLs into the URL Library to build your content queue.",
    href: "/url-library",
    done: false,
  },
  {
    step: 3,
    title: "Create a campaign",
    description: "Set a schedule, pick platforms, and assign URLs to your campaign.",
    href: "/campaigns",
    done: false,
  },
  {
    step: 4,
    title: "Configure publishing engine",
    description: "Set PROCESS_POSTS_SECRET and NEXTJS_SITE_URL in your deployment environment.",
    href: "/settings",
    done: false,
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Dashboard" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">

        {/* KPI Stats */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {statCards.map((card) => (
              <Card key={card.title} className="border">
                <CardContent className="p-4 lg:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground leading-none">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold tracking-tight text-muted-foreground/60">
                        {card.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{card.description}</p>
                    </div>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Two-column layout: System Health + Getting Started */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {systemHealthItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 lg:px-6 py-3"
                  >
                    <div className={`h-2 w-2 rounded-full shrink-0 ${item.dot}`} />
                    <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge
                      variant={item.status === "ok" ? "success" : item.status === "unconfigured" ? "warning" : "secondary"}
                      className="text-[10px] capitalize shrink-0"
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {gettingStartedSteps.map((s) => (
                  <a
                    key={s.step}
                    href={s.href}
                    className="flex items-start gap-3 px-4 lg:px-6 py-3 hover:bg-muted/30 transition-colors group"
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5 ${
                      s.done
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {s.done ? "✓" : s.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${s.done ? "line-through text-muted-foreground" : ""}`}>
                        {s.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns — empty state */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Megaphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No campaigns yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Create your first campaign to start scheduling posts across your connected platforms.
              </p>
              <a
                href="/campaigns"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                Go to Campaigns →
              </a>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
