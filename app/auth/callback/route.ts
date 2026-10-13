import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

// Only allow redirects inside ODINI, never to another website
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next
  return "/user"
}

// Where the links in Supabase emails land (password reset, and later sign-up confirmation).
// It signs the user in from the link, then sends them on to `next`.
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const next = safeNext(url.searchParams.get("next"))

  // On Vercel, use the real public address rather than the internal one
  const forwardedHost = request.headers.get("x-forwarded-host")
  const base =
    process.env.NODE_ENV !== "development" && forwardedHost
      ? `https://${forwardedHost}`
      : url.origin

  const supabase = await createClient()

  // Type 1: the default Supabase email link, which arrives with ?code=...
  const code = url.searchParams.get("code")
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${base}${next}`)
    console.error("auth callback (code) failed:", error.message)
  }

  // Type 2: links that arrive with ?token_hash=...&type=... (if you customise the email templates)
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type") as EmailOtpType | null
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) return NextResponse.redirect(`${base}${next}`)
    console.error("auth callback (token_hash) failed:", error.message)
  }

  // Link missing, expired or already used
  return NextResponse.redirect(`${base}/auth/login?error=link`)
}