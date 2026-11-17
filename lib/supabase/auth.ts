import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type CurrentUser = {
  id: string
  email: string | null
}

// Who is logged in, for pages and layouts.
//
// - getClaims() checks the login token on our own server instead of asking
//   Supabase every time (once the project uses JWT signing keys), so it's fast.
// - cache() means a layout and a page asking in the same request share one answer.
//
// The database rules (RLS) still decide what each user can read or change.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) return null

  return {
    id: data.claims.sub,
    email: (data.claims.email as string | undefined) ?? null,
  }
})
