"use server"

import { createClient } from "@/lib/supabase/server"

export async function createBookingAction(
  listingId: string,
  bookingDate: string,
  quantity: number
) {
  const supabase = await createClient()

  // Get the currently logged-in user
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

  // Create the booking
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      listing_id: listingId,
      user_id: user.id,
      booking_date: bookingDate,
      quantity,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Booking error:", error)

    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    booking: data,
  }
}
export async function createStayBookingAction({
  listingId,
  checkIn,
  nights,
  guests,
  customerName,
  customerEmail,
  customerPhone,
  paymentMethod,
}: {
  listingId: string
  checkIn: string
  nights: number
  guests: number
  customerName: string
  customerEmail: string
  customerPhone: string
  paymentMethod: "mobile_money" | "card"
}) {
  const supabase = await createClient()

  // 1. Check logged-in user
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

  // 2. Get the real listing information
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      price,
      listing_type,
      is_active,

      stays (
        max_guests
      )
    `)
    .eq("id", listingId)
    .eq("is_active", true)
    .single()

  if (listingError || !listing) {
    return {
      success: false,
      error: "This stay is no longer available.",
    }
  }

  // 3. Make sure it is actually a stay
  if (listing.listing_type !== "stay") {
    return {
      success: false,
      error: "This listing is not a stay.",
    }
  }

  // 4. Validate booking values
  if (!Number.isInteger(nights) || nights < 1) {
    return {
      success: false,
      error: "Invalid number of nights.",
    }
  }

  if (!Number.isInteger(guests) || guests < 1) {
    return {
      success: false,
      error: "Invalid number of guests.",
    }
  }

  // 5. Check maximum guests
  const maxGuests = listing.stays?.[0]?.max_guests ?? null

  if (maxGuests !== null && guests > maxGuests) {
    return {
      success: false,
      error: `This stay allows a maximum of ${maxGuests} guests.`,
    }
  }

  // 6. Calculate the checkout date
  const checkoutDate = new Date(
    new Date(`${checkIn}T00:00:00`).getTime() +
      nights * 24 * 60 * 60 * 1000
  )

  const checkOut = checkoutDate
    .toISOString()
    .split("T")[0]

  // 7. Calculate the price on the server
  const price = listing.price ?? 0
  const total = price * nights

  // 8. Generate booking reference
  const bookingReference =
    `ODN-${crypto.randomUUID().split("-")[0].toUpperCase()}`

  // 9. Save booking
  const { data: booking, error: bookingError } =
    await supabase
      .from("bookings")
      .insert({
        listing_id: listingId,
        user_id: user.id,

        booking_date: new Date().toISOString(),

        quantity: 1,

        status: "confirmed",

        booking_reference: bookingReference,

        check_in: checkIn,
        check_out: checkOut,

        nights,
        guests,

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
    console.error("Stay booking error:", bookingError)

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

export async function createEventBookingAction({
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

  // Get the event
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      price,
      listing_type,
      is_active,

      events (
        capacity,
        available_slots
      )
    `)
    .eq("id", listingId)
    .eq("is_active", true)
    .single()

  if (listingError || !listing) {
    return {
      success: false,
      error: "This event is no longer available.",
    }
  }

  if (listing.listing_type !== "event") {
    return {
      success: false,
      error: "This listing is not an event.",
    }
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return {
      success: false,
      error: "Invalid number of attendees.",
    }
  }

  const availableSlots =
    listing.events?.[0]?.available_slots ?? null

  if (
    availableSlots !== null &&
    quantity > availableSlots
  ) {
    return {
      success: false,
      error: `Only ${availableSlots} spots are available.`,
    }
  }

  const price = listing.price ?? 0
  const total = price * quantity

  const bookingReference =
    `ODN-${crypto.randomUUID().split("-")[0].toUpperCase()}`

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
    console.error("Event booking error:", bookingError)

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