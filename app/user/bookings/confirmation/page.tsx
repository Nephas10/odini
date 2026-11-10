import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

type Props = {
  searchParams: Promise<{
    id?: string
  }>
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export default async function BookingConfirmation({
  searchParams,
}: Props) {
  const { id } = await searchParams

  if (!id) {
    redirect("/user/bookings")
  }

  const supabase = await createClient()

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_reference,
      check_in,
      check_out,
      nights,
      guests,
      quantity,
      customer_name,
      customer_email,
      customer_phone,
      payment_method,
      payment_status,
      amount_paid,
      status,

      listings (
        title,
        location,
        image_url,
        listing_type
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !booking) {
    redirect("/user/bookings")
  }

  const listing = one(booking.listings)

  const listingType = listing?.listing_type

  const isStay = listingType === "stay"
  const isEvent = listingType === "event"
  const isActivity = listingType === "activity"

  return (
    <main className="min-h-screen bg-[#121012] text-white px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Success message */}
        <div className="rounded-2xl border border-white/10 bg-[#1C1A1D] p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
            <span className="text-3xl text-green-400">
              ✓
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            {isStay
              ? "Your stay is booked"
              : isEvent
              ? "Your event is booked"
              : isActivity
              ? "Your activity is booked"
              : "Your booking is confirmed"}
          </h1>

          <p className="mt-2 text-white/50">
            Your booking has been successfully confirmed.
          </p>

          {booking.booking_reference && (
            <p className="mt-4 text-sm text-white/50">
              Booking reference
            </p>
          )}

          {booking.booking_reference && (
            <p className="font-semibold text-white">
              {booking.booking_reference}
            </p>
          )}
        </div>

        {/* Booking details */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#1C1A1D] shadow-sm">

          {/* Listing image */}
          {listing?.image_url && (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="h-64 w-full object-cover"
            />
          )}

          <div className="p-6">

            {/* Listing type */}
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
              {isStay
                ? "Stay"
                : isEvent
                ? "Event"
                : isActivity
                ? "Activity"
                : "Booking"}
            </span>

            <h2 className="mt-3 text-2xl font-bold text-white">
              {listing?.title}
            </h2>

            {listing?.location && (
              <p className="mt-1 text-sm text-white/50">
                {listing.location}
              </p>
            )}

            {/* Stay details */}
            {isStay && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-[#242024] p-4">
                  <p className="text-sm text-white/50">
                    Check-in
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.check_in}
                  </p>
                </div>

                <div className="rounded-xl bg-[#242024] p-4">
                  <p className="text-sm text-white/50">
                    Check-out
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.check_out}
                  </p>
                </div>

                <div className="rounded-xl bg-[#242024] p-4">
                  <p className="text-sm text-white/50">
                    Nights
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.nights}
                  </p>
                </div>

                <div className="rounded-xl bg-[#242024] p-4">
                  <p className="text-sm text-white/50">
                    Guests
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.guests}
                  </p>
                </div>

              </div>
            )}

            {/* Event details */}
            {isEvent && (
              <div className="mt-6 rounded-xl bg-[#242024] p-4">
                <p className="text-sm text-white/50">
                  Attendees
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {booking.quantity}{" "}
                  {booking.quantity === 1
                    ? "person"
                    : "people"}
                </p>
              </div>
            )}

            {/* Activity details */}
            {isActivity && (
              <div className="mt-6 rounded-xl bg-[#242024] p-4">
                <p className="text-sm text-white/50">
                  Participants
                </p>

                <p className="mt-1 text-lg font-semibold  text-white">
                  {booking.quantity}{" "}
                  {booking.quantity === 1
                    ? "person"
                    : "people"}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Customer information */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#1C1A1D] p-6 shadow-sm">

          <h2 className="text-lg font-bold text-white">
            Customer Information
          </h2>

          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between gap-4">
              <span className="text-white/50">
                Name
              </span>

              <span className="font-medium text-right text-white">
                {booking.customer_name}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-white/50">
                Email
              </span>

              <span className="font-medium text-right text-white">
                {booking.customer_email}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-white/50">
                Phone
              </span>

              <span className="font-medium text-right text-white">
                {booking.customer_phone}
              </span>
            </div>

          </div>
        </div>

        {/* Payment information */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#1C1A1D] p-6 shadow-sm">

          <h2 className="text-lg font-bold text-white">
            Payment
          </h2>

          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-white/50">
                Payment method
              </span>

              <span className="font-medium capitalize text-white">
                {booking.payment_method?.replace(
                  "_",
                  " "
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/50">
                Payment status
              </span>

              <span className="font-medium capitalize text-green-400">
                {booking.payment_status}
              </span>
            </div>

            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="font-semibold text-white">
                Amount paid
              </span>

              <span className="text-lg font-bold text-green-400">
                ZMK{" "}
                {(
                  booking.amount_paid ?? 0
                ).toLocaleString()}
              </span>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

          <Link
            href="/user/bookings"
            className="flex-1 rounded-xl bg-[#e8365d] px-5 py-3 text-center font-medium text-white transition hover:bg-[#d02d50]"
          >
            My Bookings
          </Link>

          <Link
            href="/user"
            className="flex-1 rounded-xl border border-white/15 px-5 py-3 text-center font-medium text-white transition hover:bg-white/10"
          >
            Continue Exploring
          </Link>

        </div>

      </div>
    </main>
  )
}