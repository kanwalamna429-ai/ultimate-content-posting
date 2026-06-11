import { NextResponse, type NextRequest } from "next/server"

// ---------------------------------------------------------------------------
// Next.js 16 proxy (previously called middleware).
// Runs on Node.js runtime — not the Edge Runtime.
//
// Session detection: reads the Supabase auth cookie directly instead of
// instantiating a Supabase client, avoiding @supabase/ssr type issues and
// saving a Supabase API round-trip on every request.
//
// Cookie name set by @supabase/ssr:  sb-<project-ref>-auth-token
// ---------------------------------------------------------------------------

function hasValidSession(request: NextRequest): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false

  let projectRef: string | null = null
  try {
    const host = new URL(supabaseUrl).hostname   // e.g. abcdef.supabase.co
    projectRef = host.split(".")[0]              // e.g. abcdef
  } catch {
    return false
  }

  if (!projectRef) return false

  const cookieName = `sb-${projectRef}-auth-token`

  // Primary cookie
  if (request.cookies.get(cookieName)?.value) return true

  // Chunked cookie fallback (sb-<ref>-auth-token.0)
  if (request.cookies.get(`${cookieName}.0`)?.value) return true

  return false
}

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    const authRoutes      = ["/login", "/signup"]
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
  } catch {
    // Never let the proxy crash — pass the request through on any error
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
