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


export async function getStayRoomAvailability(
  listingId: string,
  checkIn: string,
  checkOut: string
): Promise<{
  ok: boolean
  rooms: { id: string; available: number }[]
  error?: string
}> {
  if (
    !listingId ||
    !isValidDate(checkIn) ||
    !isValidDate(checkOut) ||
    checkOut <= checkIn
  ) {
    return {
      ok: false,
      rooms: [],
      error: "Please select valid dates.",
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc(
    "get_stay_room_availability",
    {
      p_listing_id: listingId,
      p_check_in: checkIn,
      p_check_out: checkOut,
    }
  )

  if (error) {
    console.error("getStayRoomAvailability:", error.message)

    return {
      ok: false,
      rooms: [],
      error: "Unable to check availability for these dates.",
    }
  }

  return {
    ok: true,
    rooms: (data ?? []).map((room: { room_type_id: any; rooms_available: any }) => ({
      id: room.room_type_id,
      available: room.rooms_available,
    })),
  }
}

// Creates a pending booking for a specific room category.
// Only host confirmation will reserve inventory.
export async function createStayRoomBooking(
  _prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Please log in to book a room." }
  }

  const listingId = String(formData.get("listing_id") ?? "")
  const roomTypeId = String(
    formData.get("stay_room_type_id") ?? ""
  )

  const checkIn = String(formData.get("check_in") ?? "")
  const checkOut = String(formData.get("check_out") ?? "")

  const rawRooms = String(formData.get("rooms_booked") ?? "")
  const rawGuests = String(formData.get("guests") ?? "")

  const roomsBooked = Number(rawRooms)
  const guests = Number(rawGuests)

  const customerName = String(
    formData.get("customer_name") ?? ""
  ).trim()

  const customerPhone = String(
    formData.get("customer_phone") ?? ""
  ).trim()

  const paymentMethod = String(
    formData.get("payment_method") ?? ""
  )

  if (!listingId || !roomTypeId) {
    return { error: "Please select a room category." }
  }

  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    return { error: "Please select valid booking dates." }
  }

  // Reject dates that JavaScript would otherwise normalize,
  // such as February 30.
  const validCalendarDate = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`)
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    )
  }

  if (
    !validCalendarDate(checkIn) ||
    !validCalendarDate(checkOut)
  ) {
    return { error: "Please select valid calendar dates." }
  }

  if (checkIn < todayInZambia()) {
    return { error: "Check-in cannot be in the past." }
  }

  if (checkOut <= checkIn) {
    return { error: "Checkout must be after check-in." }
  }

  const nights = Math.round(
    (new Date(`${checkOut}T00:00:00Z`).getTime() -
      new Date(`${checkIn}T00:00:00Z`).getTime()) /
      86_400_000
  )

  // Matches our existing availability RPC limit.
  if (nights < 1 || nights > 90) {
    return { error: "Choose a stay between 1 and 90 nights." }
  }

  if (
    rawRooms.trim() === "" ||
    !Number.isSafeInteger(roomsBooked) ||
    roomsBooked < 1 ||
    roomsBooked > 10
  ) {
    return { error: "Choose between 1 and 10 rooms." }
  }

  if (
    rawGuests.trim() === "" ||
    !Number.isSafeInteger(guests) ||
    guests < 1
  ) {
    return { error: "Enter a valid number of guests." }
  }

  if (!customerName || !customerPhone) {
    return { error: "Please enter your contact details." }
  }

  if (
    paymentMethod !== "mobile_money" &&
    paymentMethod !== "card"
  ) {
    return { error: "Please choose a payment method." }
  }

  // Check that the property is published.
  const { data: listing, error: listingError } =
    await supabase
      .from("listings")
      .select("id, title")
      .eq("id", listingId)
      .eq("listing_type", "stay")
      .eq("is_active", true)
      .maybeSingle()

  if (listingError || !listing) {
    return { error: "This property is no longer available." }
  }

  // Get authoritative room details and price.
  const { data: room, error: roomError } = await supabase
    .from("stay_room_types")
    .select(`
      id,
      name,
      price_per_night,
      max_guests_per_room
    `)
    .eq("id", roomTypeId)
    .eq("listing_id", listingId)
    .eq("is_active", true)
    .maybeSingle()

  if (roomError || !room) {
    return { error: "This room category is unavailable." }
  }

  if (guests > roomsBooked * room.max_guests_per_room) {
    return {
      error: `The selected rooms accommodate up to ${
        roomsBooked * room.max_guests_per_room
      } guests.`,
    }
  }

  // Check availability before accepting the request.
  // This is provisional: host confirmation checks again.
  const availability = await getStayRoomAvailability(
    listingId,
    checkIn,
    checkOut
  )

  if (!availability.ok) {
    return {
      error: availability.error ?? "Unable to check availability.",
    }
  }

  const selectedAvailability = availability.rooms.find(
    (item) => item.id === roomTypeId
  )

  if (
    !selectedAvailability ||
    selectedAvailability.available < roomsBooked
  ) {
    return {
      error: "Not enough rooms are available for these dates.",
    }
  }

  // Save a PENDING request. The database supplies the
  // pending status and existing unpaid defaults.
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = makeReference()

    const { error } = await supabase
      .from("bookings")
      .insert({
        listing_id: listingId,
        user_id: user.id,
        stay_room_type_id: roomTypeId,
        rooms_booked: roomsBooked,
        quantity: roomsBooked,
        check_in: checkIn,
        check_out: checkOut,
        nights,
        guests,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: user.email ?? null,
        payment_method: paymentMethod,
        booking_reference: reference,
      })

    if (!error) {
      const total =
        room.price_per_night * roomsBooked * nights

      const whatsappUrl = await hostWhatsAppUrl(
        supabase,
        listingId,
        {
          reference,
          listingTitle: listing.title,
          customerName,
          lines: [
            `Room: ${room.name}`,
            `Rooms requested: ${roomsBooked}`,
            `Check-in: ${messageDate(checkIn)}`,
            `Check-out: ${messageDate(checkOut)}`,
            `Nights: ${nights}`,
            `Guests: ${guests}`,
          ],
          total,
        }
      )

      return { reference, whatsappUrl }
    }

    // Retry only a reference collision.
    if (error.code !== "23505") {
      console.error(
        "createStayRoomBooking failed:",
        error.message
      )

      return {
        error: "We couldn't save your request. Please try again.",
      }
    }
  }

  return {
    error: "Unable to generate a booking reference. Try again.",
  }
}
