"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type BecomeHostState = {
  error?: string
}

// Turns the logged-in user into a host. The role change itself happens in the
// database function become_host, which only allows user -> host for yourself.
export async function becomeHost(
  _prevState: BecomeHostState,
  formData: FormData
): Promise<BecomeHostState> {
  const businessName = String(formData.get("business_name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const acceptedTerms = formData.get("accepted_terms") === "on"

  if (!businessName) return { error: "Please enter your business or host name." }
  if (businessName.length > 80) return { error: "Please keep the name under 80 characters." }
  if (!phone) return { error: "Please enter the WhatsApp number guests should contact." }
  if (!acceptedTerms) {
    return { error: "Please agree to the Terms and Conditions, including the Partner rules." }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/host/become")

  const { error } = await supabase.rpc("become_host", {
    p_business_name: businessName,
    p_phone: phone,
  })

  if (error) {
    if (error.message.includes("role_not_allowed")) {
      return { error: "Your account type can't be changed to a host account." }
    }
    if (error.message.includes("no_profile")) {
      return { error: "We couldn't find your profile. Please log out and back in, then try again." }
    }
    console.error("becomeHost failed:", error.message)
    return { error: "We couldn't set up your host account. Please try again." }
  }

  redirect("/host")
}