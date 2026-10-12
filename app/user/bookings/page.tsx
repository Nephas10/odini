import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export default async function MyBookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_reference,
      booking_date,
      check_in,
      check_out,
      nights,
      guests,
      quantity,
      customer_name,
      payment_method,
      payment_status,
      amount_paid,
      status,

      listings (
        id,
        title,
        location,
        price,
        image_url,
        listing_type
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Bookings
          </h1>

          <p className="mt-2 text-gray-500">
            View and manage your bookings.
          </p>
        </div>

        {/* Empty state */}
        {!bookings || bookings.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">

            <h2 className="text-xl font-semibold text-gray-900">
              No bookings yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your bookings will appear here once you make one.
            </p>

            <Link
              href="/user"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
            >
              Explore Listings
            </Link>

          </div>
        ) : (
          <div className="mt-8 space-y-6">

            {bookings.map((booking) => {
              const listing = one(booking.listings)

              const listingType =
                listing?.listing_type

              const isStay =
                listingType === "stay"

              const isEvent =
                listingType === "event"

              const isActivity =
                listingType === "activity"

              return (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >

                  {/* Image */}
                  {listing?.image_url && (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="h-56 w-full object-cover"
                    />
                  )}

                  <div className="p-6">

                    {/* Type + status */}
                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {isStay
                          ? "Stay"
                          : isEvent
                          ? "Event"
                          : isActivity
                          ? "Activity"
                          : "Booking"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status}
                      </span>

                    </div>

                    {/* Listing title */}
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">
                      {listing?.title}
                    </h2>

                    {listing?.location && (
                      <p className="mt-1 text-sm text-gray-500">
                        {listing.location}
                      </p>
                    )}

                    {/* Stay information */}
                    {isStay && (
                      <div className="mt-6 grid gap-4 sm:grid-cols-3">

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
                            Guests
                          </p>

                          <p className="mt-1 font-semibold">
                            {booking.guests}
                          </p>
                        </div>

                      </div>
                    )}

                    {/* Event information */}
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

                    {/* Activity information */}
                    {isActivity && (
                      <div className="mt-6 rounded-xl bg-gray-50 p-4">

                        <p className="text-sm text-gray-500">
                          Participants
                        </p>

                        <p className="mt-1 text-lg font-semibold text-black">
                          {booking.quantity}{" "}
                          {booking.quantity === 1
                            ? "person"
                            : "people"}
                        </p>

                      </div>
                    )}

                    {/* Booking information */}
                    <div className="mt-6 border-t pt-5">

                      <div className="grid gap-4 sm:grid-cols-2">

                        <div>
                          <p className="text-sm text-gray-500">
                            Booking reference
                          </p>

                          <p className="mt-1 font-medium text-black">
                            {booking.booking_reference ?? "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Payment
                          </p>

                          <p className="mt-1 font-medium capitalize text-black">
                            {booking.payment_method
                              ?.replace("_", " ") ?? "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Payment status
                          </p>

                          <p className="mt-1 font-medium capitalize text-green-600">
                            {booking.payment_status ?? "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Amount paid
                          </p>

                          <p className="mt-1 text-lg font-bold text-green-500">
                            ZMK{" "}
                            {(
                              booking.amount_paid ?? 0
                            ).toLocaleString()}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                      {listing?.id && (
                        <Link
                          href={`/user/listings/${listing.id}`}
                          className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-center font-medium text-gray-900 hover:bg-gray-50"
                        >
                          View Listing
                        </Link>
                      )}

                      <Link
                        href={`/user/bookings/confirmation?id=${booking.id}`}
                        className="flex-1 rounded-xl bg-black px-5 py-3 text-center font-medium text-white hover:bg-gray-800"
                      >
                        View Booking
                      </Link>

                    </div>

                  </div>
                </div>
              )
            })}

          </div>
        )}

      </div>
    </main>
  )
}