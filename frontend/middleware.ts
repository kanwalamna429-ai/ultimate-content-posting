import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip auth guard if credentials are absent or not a valid URL
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }
  try {
    const parsed = new URL(supabaseUrl)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return NextResponse.next({ request })
    }
  } catch {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  let supabase
  try {
    supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })
  } catch {
    return NextResponse.next({ request })
  }

  let user = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch {
    return NextResponse.next({ request })
  }

  const { pathname } = request.nextUrl

  const authRoutes = ["/login", "/signup"]
  const protectedRoutes = [
    "/dashboard",
    "/campaigns",
    "/url-library",
    "/connections",
    "/logs",
    "/settings",
  ]

  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (user && authRoutes.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
