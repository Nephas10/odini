"use server"

import { createClient } from "@/lib/supabase/server"

export async function createActivityBookingAction({
  listingId,
  quantity,
  customerName,
  customerEmail,
  customerPhone,
  paymentMethod,
}: {
  listingId: string
  quantity: number
  customerName: string
  customerEmail: string
  customerPhone: string
  paymentMethod: "mobile_money" | "card"
}) {
  const supabase = await createClient()

  // Check logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: "You must be logged in to make a booking.",
    }
  }

  // Get the activity
  const { data: listing, error: listingError } =
    await supabase
      .from("listings")
      .select(`
        id,
        title,
        price,
        listing_type,
        is_active,

        activities (
          max_participants
        )
      `)
      .eq("id", listingId)
      .eq("is_active", true)
      .single()

  if (listingError || !listing) {
    return {
      success: false,
      error: "This activity is no longer available.",
    }
  }

  // Make sure this is an activity
  if (listing.listing_type !== "activity") {
    return {
      success: false,
      error: "This listing is not an activity.",
    }
  }

  // Validate quantity
  if (!Number.isInteger(quantity) || quantity < 1) {
    return {
      success: false,
      error: "Invalid number of participants.",
    }
  }

  // Check maximum participants
  const maxParticipants =
    listing.activities?.[0]?.max_participants ?? null

  if (
    maxParticipants !== null &&
    quantity > maxParticipants
  ) {
    return {
      success: false,
      error: `This activity allows a maximum of ${maxParticipants} participants.`,
    }
  }

  // Calculate total
  const price = listing.price ?? 0
  const total = price * quantity

  // Generate booking reference
  const bookingReference =
    `ODN-${crypto.randomUUID().split("-")[0].toUpperCase()}`

  // Create booking
  const { data: booking, error: bookingError } =
    await supabase
      .from("bookings")
      .insert({
        listing_id: listingId,
        user_id: user.id,
        booking_date: new Date().toISOString(),
        quantity,

        status: "confirmed",

        booking_reference: bookingReference,

        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,

        payment_method: paymentMethod,
        payment_status: "paid",
        amount_paid: total,
      })
      .select()
      .single()

  if (bookingError) {
    console.error(
      "Activity booking error:",
      bookingError
    )

    return {
      success: false,
      error: bookingError.message,
    }
  }

  return {
    success: true,
    booking,
  }
}