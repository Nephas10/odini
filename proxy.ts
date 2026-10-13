import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

// Pages that need a logged-in user
const PROTECTED_PREFIXES = ["/user", "/host"]

// Pages a logged-in user has no reason to see (they go to /user instead).
// Not forgot-password / reset-password / callback: the reset flow needs those
// while the user is signed in from the email link.
const LOGGED_OUT_ONLY = ["/auth/login", "/auth/signup"]

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

// Redirect while keeping any refreshed login cookies, so users aren't logged out at random
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url)
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Also refreshes the session if it's close to expiring. Keep this call
  // directly after createServerClient, with no other code in between.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  // Not logged in, trying to open a protected page: send to login,
  // remembering where they were going
  if (!user && matches(pathname, PROTECTED_PREFIXES)) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("next", pathname + search)
    return redirectWithCookies(loginUrl, response)
  }

  // Already logged in, opening login or sign-up: go to the app instead
  if (user && matches(pathname, LOGGED_OUT_ONLY)) {
    return redirectWithCookies(new URL("/user", request.url), response)
  }

  return response
}

export const config = {
  // Run on every page, but skip Next.js internals and static files (images, icons, fonts)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
}