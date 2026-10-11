"use server"

import { createClient } from "@/lib/supabase/server"

type CreateListingInput = {
  listingType: "stay" | "event" | "activity"

  title: string
  description: string
  price: number
  location: string

  publish: boolean

  maxGuests?: number

  eventType?: string
  eventTime?: string
  endTime?: string
  capacity?: number
  availableSlots?: number

  activityCategory?: string
  durationMinutes?: number
  maxParticipants?: number
  meetingPoint?: string
}

export async function createListingAction(
  input: CreateListingInput
) {
  const supabase = await createClient()

  // Check logged-in host
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: "You must be logged in.",
    }
  }

  // Common validation
  if (!input.title.trim()) {
    return {
      success: false,
      error: "Title is required.",
    }
  }

  if (!input.description.trim()) {
    return {
      success: false,
      error: "Description is required.",
    }
  }

  if (!input.location.trim()) {
    return {
      success: false,
      error: "Location is required.",
    }
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    return {
      success: false,
      error: "Price must be 0 or greater.",
    }
  }

  // Type-specific validation
  if (input.listingType === "stay") {
    if (
      !Number.isInteger(input.maxGuests) ||
      (input.maxGuests ?? 0) <= 0
    ) {
      return {
        success: false,
        error: "Maximum guests must be greater than 0.",
      }
    }
  }

  if (input.listingType === "event") {
    if (!input.eventTime) {
      return {
        success: false,
        error: "Event date and time are required.",
      }
    }

    if (
      !Number.isInteger(input.capacity) ||
      (input.capacity ?? 0) <= 0
    ) {
      return {
        success: false,
        error: "Event capacity must be greater than 0.",
      }
    }

    if (
      !Number.isInteger(input.availableSlots) ||
      (input.availableSlots ?? -1) < 0
    ) {
      return {
        success: false,
        error: "Available slots cannot be negative.",
      }
    }

    if (
      (input.availableSlots ?? 0) >
      (input.capacity ?? 0)
    ) {
      return {
        success: false,
        error: "Available slots cannot exceed capacity.",
      }
    }
  }

  if (input.listingType === "activity") {
    if (
      !Number.isInteger(input.durationMinutes) ||
      (input.durationMinutes ?? 0) <= 0
    ) {
      return {
        success: false,
        error: "Duration must be greater than 0.",
      }
    }

    if (
      !Number.isInteger(input.maxParticipants) ||
      (input.maxParticipants ?? 0) <= 0
    ) {
      return {
        success: false,
        error: "Maximum participants must be greater than 0.",
      }
    }
  }

  // Create main listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      host_id: user.id,
      listing_type: input.listingType,
      title: input.title.trim(),
      description: input.description.trim(),
      price: input.price,
      location: input.location.trim(),
      is_active: input.publish,
    })
    .select("id")
    .single()

  if (listingError || !listing) {
    console.error("Create listing error:", listingError)

    return {
      success: false,
      error: listingError?.message ?? "Failed to create listing.",
    }
  }

  // Create stay details
  if (input.listingType === "stay") {
    const { error } = await supabase
      .from("stays")
      .insert({
        listing_id: listing.id,
        max_guests: input.maxGuests,
      })

    if (error) {
      console.error("Create stay details error:", error)

      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Create event details
  if (input.listingType === "event") {
    const { error } = await supabase
      .from("events")
      .insert({
        listing_id: listing.id,
        event_time: input.eventTime,
        end_time: input.endTime || null,
        event_type: input.eventType?.trim() || null,
        capacity: input.capacity,
        available_slots: input.availableSlots,
      })

    if (error) {
      console.error("Create event details error:", error)

      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Create activity details
  if (input.listingType === "activity") {
    const { error } = await supabase
      .from("activities")
      .insert({
        listing_id: listing.id,
        activity_category:
          input.activityCategory?.trim() || null,
        duration_minutes: input.durationMinutes,
        max_participants: input.maxParticipants,
        meeting_point:
          input.meetingPoint?.trim() || null,
      })

    if (error) {
      console.error("Create activity details error:", error)

      return {
        success: false,
        error: error.message,
      }
    }
  }

  return {
    success: true,
    listingId: listing.id,
    published: input.publish,
  }
}