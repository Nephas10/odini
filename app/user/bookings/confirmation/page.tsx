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
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Success message */}
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl text-green-600">
              ✓
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            {isStay
              ? "Your stay is booked"
              : isEvent
              ? "Your event is booked"
              : isActivity
              ? "Your activity is booked"
              : "Your booking is confirmed"}
          </h1>

          <p className="mt-2 text-gray-500">
            Your booking has been successfully confirmed.
          </p>

          {booking.booking_reference && (
            <p className="mt-4 text-sm text-gray-500">
              Booking reference
            </p>
          )}

          {booking.booking_reference && (
            <p className="font-semibold text-gray-900">
              {booking.booking_reference}
            </p>
          )}
        </div>

        {/* Booking details */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">

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
            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {isStay
                ? "Stay"
                : isEvent
                ? "Event"
                : isActivity
                ? "Activity"
                : "Booking"}
            </span>

            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {listing?.title}
            </h2>

            {listing?.location && (
              <p className="mt-1 text-sm text-gray-500">
                {listing.location}
              </p>
            )}

            {/* Stay details */}
            {isStay && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Check-in
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.check_in}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Check-out
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.check_out}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Nights
                  </p>
                  <p className="mt-1 font-semibold">
                    {booking.nights}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
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
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
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
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Participants
                </p>

                <p className="mt-1 text-lg font-semibold  text-black">
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
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">
            Customer Information
          </h2>

          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Name
              </span>

              <span className="font-medium text-right text-black">
                {booking.customer_name}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Email
              </span>

              <span className="font-medium text-right text-black">
                {booking.customer_email}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Phone
              </span>

              <span className="font-medium text-right text-black">
                {booking.customer_phone}
              </span>
            </div>

          </div>
        </div>

        {/* Payment information */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">
            Payment
          </h2>

          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">
                Payment method
              </span>

              <span className="font-medium capitalize text-black">
                {booking.payment_method?.replace(
                  "_",
                  " "
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Payment status
              </span>

              <span className="font-medium capitalize text-green-600">
                {booking.payment_status}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold text-black">
                Amount paid
              </span>

              <span className="text-lg font-bold text-green-500">
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
            className="flex-1 rounded-xl bg-black px-5 py-3 text-center font-medium text-white transition hover:bg-gray-800"
          >
            My Bookings
          </Link>

          <Link
            href="/user"
            className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-3 text-center font-medium text-gray-900 transition hover:bg-gray-50"
          >
            Continue Exploring
          </Link>

        </div>

      </div>
    </main>
  )
}