"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function logoutAction() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect("/auth/login")
}

export async function getListings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      listing_type,
      title,
      description,
      price,
      location,
      image_url, 
      is_active,
      created_at,
      events (
        event_time,
        end_time
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching listings:", error)

    return {
      success: false,
      listings: [],
      error: error.message,
    }
  }

  return {
    success: true,
    listings: data,
    error: null,
  }
}

export async function getListingById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      listing_type,
      title,
      description,
      price,
      location,
      image_url,
      is_active,
      created_at,

      stays (
        max_guests,
        available_rooms,
        duration_nights
      ),

      events (
        event_time,
        end_time,
        event_type,
        capacity,
        available_slots
      ),

      services (
        service_category,
        duration_minutes,
        opening_time,
        closing_time,
        max_bookings
      ),

      activities (
        activity_category,
        duration_minutes,
        max_participants,
        meeting_point
      )
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error) {
    console.error("Error fetching listing:", error)

    return {
      success: false,
      listing: null,
      error: error.message,
    }
  }

  return {
    success: true,
    listing: data,
    error: null,
  }
}