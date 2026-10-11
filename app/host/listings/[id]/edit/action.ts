"use server"

import { createClient } from "@/lib/supabase/server"

type UpdateListingInput = {
  id: string

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

export async function updateListingAction(
  input: UpdateListingInput
) {
  const supabase = await createClient()

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

  // Validate common fields
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

  // Validate stay
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

  // Validate event
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

  // Validate activity
  if (input.listingType === "activity") {
    if(!input.durationMinutes || input.durationMinutes < 1){
        return {
            success: false,
            error: "Duration must be atleast 1 minute."
        }
    }
    if(!input.maxParticipants || input.maxParticipants < 1){
        return {
            success: false,
            error: "Maximum participants must be atleasst 1."
        }
    }
  }

  // Update main listing
  const { error: listingError } = await supabase
    .from("listings")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      price: input.price,
      location: input.location.trim(),
      is_active: input.publish,
    })
    .eq("id", input.id)
    .eq("host_id", user.id)

  if (listingError) {
    console.error("Update listing error:", listingError)

    return {
      success: false,
      error: listingError.message,
    }
  }

  // Update stay
  if (input.listingType === "stay") {
    const { error } = await supabase
      .from("stays")
      .update({
        max_guests: input.maxGuests,
      })
      .eq("listing_id", input.id)

    if (error) {
      console.error("Update stay error:", error)

      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Update event
  if (input.listingType === "event") {
    const { error } = await supabase
      .from("events")
      .update({
        event_type: input.eventType?.trim() || null,
        event_time: input.eventTime,
        end_time: input.endTime || null,
        capacity: input.capacity,
        available_slots: input.availableSlots,
      })
      .eq("listing_id", input.id)

    if (error) {
      console.error("Update event error:", error)

      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Update activity
  if (input.listingType === "activity") {
    const { error } = await supabase
      .from("activities")
      .update({
        activity_category: input.activityCategory?.trim() || null,
        duration_minutes: input.durationMinutes,
        max_participants: input.maxParticipants,
        meeting_point: input.meetingPoint?.trim() || null,
      })
      .eq("listing_id", input.id)

    if (error) {
      console.error("Update activity error:", error)

      return {
        success: false,
        error: error.message,
      }
    }
  }

  return {
    success: true,
    published: input.publish,
  }
}