"use server"

import { createClient } from "@/lib/supabase/server"

type SignupData = {
  name: string
  email: string
  phone: string
  password: string
  acceptedTerms: boolean
}

export async function signupAction(data: SignupData) {
  const name = data.name?.trim() ?? ""
  const email = data.email?.trim() ?? ""
  const phone = data.phone?.trim() ?? ""
  const password = data.password ?? ""

  // Checked here on the server too, so the checkbox can't be skipped
  if (!data.acceptedTerms) {
    return { success: false, error: "Please agree to the Terms and Conditions." }
  }

  if (!name) return { success: false, error: "Please enter your full name." }
  if (!email) return { success: false, error: "Please enter your email." }
  if (!phone) return { success: false, error: "Please enter your WhatsApp number." }
  if (password.length < 6) {
    return { success: false, error: "Your password must be at least 6 characters." }
  }

  const supabase = await createClient()

  // Create authentication user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: "Unable to create user." }
  }

  // Create profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: authData.user.id,
    firstname: name,
    phone_number: phone,
  })

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  return { success: true }
}

type LoginData = {
  email: string
  password: string
}

export async function loginAction(data: LoginData) {
  const email = data.email?.trim().toLowerCase() ?? ""
  const password = data.password ?? ""

  // Checked here too, not just in the browser
  if (!email || !password) {
    return { success: false, error: "Please enter your email and password." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Turn Supabase's messages into plain ones
    const message = error.message.toLowerCase()

    if (message.includes("invalid login credentials")) {
      return {
        success: false,
        error: "That email and password don't match. Please check them and try again.",
      }
    }
    if (message.includes("email not confirmed")) {
      return {
        success: false,
        error: "Please confirm your email first. Check your inbox for the link we sent you.",
      }
    }
    if (message.includes("rate limit") || error.status === 429) {
      return {
        success: false,
        error: "Too many attempts. Please wait a minute and try again.",
      }
    }

    console.error("loginAction failed:", error.message)
    return { success: false, error: "We couldn't log you in. Please try again." }
  }

  return { success: true }
}