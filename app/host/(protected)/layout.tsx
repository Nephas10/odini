import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import HostNavbar from "./HostNavbar"

// Wraps every host page inside (protected): only hosts get through.
// /host/become sits outside this folder, so regular users can still reach it.
export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/host")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, business_name, firstname")
    .eq("id", user.id)
    .maybeSingle()

  // Logged in but not a host yet: send them to the host sign-up
  if (profile?.role !== "host") redirect("/host/become")

  return (
    <>
      <HostNavbar businessName={profile.business_name || profile.firstname || "Your business"} />
      {children}
    </>
  )
}