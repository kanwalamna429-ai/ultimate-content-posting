import { NextResponse, type NextRequest } from "next/server"

// ---------------------------------------------------------------------------
// Session detection — reads the Supabase auth cookie directly.
//
// Why no Supabase client here:
//   @supabase/ssr 0.12 exposes a restricted SupabaseAuthClient type in the
//   middleware context that omits both getUser() and getSession() from its
//   TypeScript declarations, causing build failures on strict type checkers
//   (Vercel CI). Reading the cookie directly is also faster — no client
//   instantiation or network round-trip on every request.
//
// The cookie Supabase sets is named:  sb-<project-ref>-auth-token
// We detect it by its prefix/suffix pattern so the code stays project-agnostic.
// ---------------------------------------------------------------------------

function hasValidSession(request: NextRequest): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false

  // Extract project ref from URL: https://<ref>.supabase.co
  let projectRef: string | null = null
  try {
    const host = new URL(supabaseUrl).hostname        // e.g. abcdef.supabase.co
    projectRef = host.split(".")[0]                   // e.g. abcdef
  } catch {
    return false
  }

  if (!projectRef) return false

  // Primary cookie name used by @supabase/ssr
  const cookieName = `sb-${projectRef}-auth-token`
  const cookie = request.cookies.get(cookieName)
  if (cookie?.value) return true

  // Fallback: chunked cookie pattern (sb-<ref>-auth-token.0, .1, …)
  const chunk0 = request.cookies.get(`${cookieName}.0`)
  if (chunk0?.value) return true

  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const authRoutes     = ["/login", "/signup"]
  const protectedRoutes = [
    "/dashboard",
    "/campaigns",
    "/url-library",
    "/connections",
    "/logs",
    "/settings",
  ]

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute  = authRoutes.includes(pathname)

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next({ request })
  }

  const loggedIn = hasValidSession(request)

  if (!loggedIn && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (loggedIn && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
