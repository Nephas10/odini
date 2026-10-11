"use server"

import { createClient } from "@/lib/supabase/server"
import { messageDate, whatsAppLink, type BookingMessageDetails } from "./whatsapp"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export type BookingState = {
  error?: string
  reference?: string
  
  whatsappUrl?: string
}
// After a booking is saved: look up the host's number and build the WhatsApp link.
// If anything goes wrong here, the booking is still saved, so we just skip the button.
async function hostWhatsAppUrl(
  supabase: SupabaseClient,
  listingId: string,
  details: BookingMessageDetails
): Promise<string | undefined> {
  const { data: hostPhone, error } = await supabase.rpc("get_host_phone", {
    p_listing_id: listingId,
  })
  if (error) {
    console.error("get_host_phone failed:", error.message)
    return undefined
  }
  return whatsAppLink(hostPhone as string | null, details) ?? undefined
}

// Today's date as YYYY-MM-DD in Zambian time
function todayInZambia() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lusaka" })
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())
}

// e.g. ODN-7K2M9Q (no 0/O or 1/I, so it's easy to read out on WhatsApp)
function makeReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `ODN-${code}`
}

// Saves a stay booking. Checks everything again here on the server,
// because anything the browser sends can be changed.
export async function createStayBooking(
  _prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const supabase = await createClient()

  // 1. Must be logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Please log in to make a booking." }

  // 2. Read the form
  const listingId = String(formData.get("listing_id") ?? "")
  const checkIn = String(formData.get("check_in") ?? "")
  const checkOut = String(formData.get("check_out") ?? "")
  const guests = Number(formData.get("guests"))
  const customerName = String(formData.get("customer_name") ?? "").trim()
  const customerPhone = String(formData.get("customer_phone") ?? "").trim()
  const paymentMethod = String(formData.get("payment_method") ?? "")

  // 3. Check the input
  if (!listingId) return { error: "Something went wrong. Please reload the page." }
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    return { error: "Please choose valid check-in and check-out dates." }
  }
  if (checkIn < todayInZambia()) return { error: "Check-in can't be in the past." }
  if (checkOut <= checkIn) return { error: "Check-out must be after check-in." }
  if (!Number.isInteger(guests) || guests < 1) {
    return { error: "Please enter at least 1 guest." }
  }
  if (!customerName) return { error: "Please enter your name." }
  if (!customerPhone) return { error: "Please enter your WhatsApp number." }
  if (paymentMethod !== "mobile_money" && paymentMethod !== "card") {
    return { error: "Please choose a payment method." }
  }

  // 4. Check the listing is a real stay, and the guest count fits
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title, price, listing_type, stays(max_guests)")
    .eq("id", listingId)
    .maybeSingle()

  if (listingError || !listing) return { error: "This listing is no longer available." }
  if (listing.listing_type !== "stay") return { error: "This listing isn't a stay." }

  const maxGuests = listing.stays?.[0]?.max_guests ?? null
  if (maxGuests !== null && guests > maxGuests) {
    return { error: `This stay allows a maximum of ${maxGuests} guests.` }
  }

  const nights = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
  )

  // 5. Save it. Retry with a new reference if one happens to be taken already.
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = makeReference()

    const { error } = await supabase.from("bookings").insert({
      listing_id: listingId,
      user_id: user.id,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      guests,
      quantity: 1,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: user.email ?? null,
      payment_method: paymentMethod,
      booking_reference: reference,
    })

    if (!error) {
      const whatsappUrl = await hostWhatsAppUrl(supabase, listingId, {
        reference,
        listingTitle: listing.title,
        customerName,
        lines: [
          `Check-in: ${messageDate(checkIn)}`,
          `Check-out: ${messageDate(checkOut)} (${nights} ${nights === 1 ? "night" : "nights"})`,
          `Guests: ${guests}`,
        ],
        total: listing.price !== null ? listing.price * nights : null,
      })
      return { reference, whatsappUrl }
    }

    // 23505 = unique value already exists (the reference). Anything else is a real failure.
    if (error.code !== "23505") {
      console.error("createStayBooking failed:", error.message)
      return { error: "We couldn't save your booking. Please try again." }
    }
  }

  return { error: "We couldn't save your booking. Please try again." }
}

// Saves an event booking. The database function book_event takes the tickets
// and creates the booking in one step, so the last spot can't be sold twice.
export async function createEventBooking(
  _prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const supabase = await createClient()

  // 1. Must be logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Please log in to book tickets." }

  // 2. Read the form
  const listingId = String(formData.get("listing_id") ?? "")
  const quantity = Number(formData.get("quantity"))
  const customerName = String(formData.get("customer_name") ?? "").trim()
  const customerPhone = String(formData.get("customer_phone") ?? "").trim()
  const paymentMethod = String(formData.get("payment_method") ?? "")

  // 3. Check the input
  if (!listingId) return { error: "Something went wrong. Please reload the page." }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return { error: "Please choose between 1 and 10 tickets." }
  }
  if (!customerName) return { error: "Please enter your name." }
  if (!customerPhone) return { error: "Please enter your WhatsApp number." }
  if (paymentMethod !== "mobile_money" && paymentMethod !== "card") {
    return { error: "Please choose a payment method." }
  }

  // 4. Book it. Retry with a new reference if one happens to be taken already.
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = makeReference()

    const { error } = await supabase.rpc("book_event", {
      p_listing_id: listingId,
      p_quantity: quantity,
      p_customer_name: customerName,
      p_customer_phone: customerPhone,
      p_customer_email: user.email ?? null,
      p_payment_method: paymentMethod,
      p_reference: reference,
    })

    if (!error) {
      // Get the event's title, price and time for the WhatsApp message
      const { data: listing } = await supabase
        .from("listings")
        .select("title, price, events(event_time)")
        .eq("id", listingId)
        .maybeSingle()

      const eventTime = listing?.events?.[0]?.event_time
      const lines = [`Tickets: ${quantity}`]
      if (eventTime) {
        lines.unshift(
          `Event date: ${new Date(eventTime).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Africa/Lusaka",
          })}`
        )
      }

      const whatsappUrl = listing
        ? await hostWhatsAppUrl(supabase, listingId, {
            reference,
            listingTitle: listing.title,
            customerName,
            lines,
            total: listing.price !== null ? listing.price * quantity : null,
          })
        : undefined

      return { reference, whatsappUrl }
    }

    // Reference already taken: try again with a new one
    if (error.code === "23505") continue

    // Turn the database's reasons into messages the customer understands
    if (error.message.includes("not_enough_slots")) {
      return {
        error:
          "There aren't enough tickets left for that many, or this event has already started. Please try fewer tickets.",
      }
    }
    if (error.message.includes("not_logged_in")) {
      return { error: "Please log in to book tickets." }
    }
    if (error.message.includes("bad_quantity")) {
      return { error: "Please choose between 1 and 10 tickets." }
    }

    console.error("createEventBooking failed:", error.message)
    return { error: "We couldn't save your booking. Please try again." }
  }

  return { error: "We couldn't save your booking. Please try again." }
}

// Saves an activity booking: one date, a number of people.
export async function createActivityBooking(
  _prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const supabase = await createClient()

  // 1. Must be logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Please log in to make a booking." }

  // 2. Read the form
  const listingId = String(formData.get("listing_id") ?? "")
  const activityDate = String(formData.get("activity_date") ?? "")
  const guests = Number(formData.get("guests"))
  const customerName = String(formData.get("customer_name") ?? "").trim()
  const customerPhone = String(formData.get("customer_phone") ?? "").trim()
  const paymentMethod = String(formData.get("payment_method") ?? "")

  // 3. Check the input
  if (!listingId) return { error: "Something went wrong. Please reload the page." }
  if (!isValidDate(activityDate)) return { error: "Please choose a valid date." }
  if (activityDate < todayInZambia()) return { error: "The date can't be in the past." }
  if (!Number.isInteger(guests) || guests < 1) {
    return { error: "Please book for at least 1 person." }
  }
  if (!customerName) return { error: "Please enter your name." }
  if (!customerPhone) return { error: "Please enter your WhatsApp number." }
  if (paymentMethod !== "mobile_money" && paymentMethod !== "card") {
    return { error: "Please choose a payment method." }
  }

  // 4. Check the listing is a real activity, and the group size fits
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title, price, listing_type, activities(max_participants)")
    .eq("id", listingId)
    .maybeSingle()

  if (listingError || !listing) return { error: "This listing is no longer available." }
  if (listing.listing_type !== "activity") return { error: "This listing isn't an activity." }

  const maxParticipants = listing.activities?.[0]?.max_participants ?? null
  if (maxParticipants !== null && guests > maxParticipants) {
    return { error: `This activity allows a maximum of ${maxParticipants} people.` }
  }

  // 5. Save it. booking_date stores the chosen day at midnight Zambian time,
  //    so it shows as the right day no matter where it's read.
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = makeReference()

    const { error } = await supabase.from("bookings").insert({
      listing_id: listingId,
      user_id: user.id,
      booking_date: `${activityDate}T00:00:00+02:00`,
      guests,
      quantity: 1,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: user.email ?? null,
      payment_method: paymentMethod,
      booking_reference: reference,
    })

    if (!error) {
      const whatsappUrl = await hostWhatsAppUrl(supabase, listingId, {
        reference,
        listingTitle: listing.title,
        customerName,
        lines: [`Date: ${messageDate(activityDate)}`, `People: ${guests}`],
        total: listing.price !== null ? listing.price * guests : null,
      })
      return { reference, whatsappUrl }
    }

    // 23505 = reference already taken. Anything else is a real failure.
    if (error.code !== "23505") {
      console.error("createActivityBooking failed:", error.message)
      return { error: "We couldn't save your booking. Please try again." }
    }
  }

  return { error: "We couldn't save your booking. Please try again." }
}