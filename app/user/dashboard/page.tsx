import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"


function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}


export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("firstname, lastname, username")
    .eq("id", user.id)
    .single()

  // Get bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_reference,
      booking_date,
      quantity,
      status,
      amount_paid,

      listings (
        id,
        title,
        listing_type,
        location,
        image_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const totalBookings = bookings?.length ?? 0

  const confirmedBookings =
    bookings?.filter(
      (booking) => booking.status === "confirmed"
    ).length ?? 0

  const recentBookings =
    bookings?.slice(0, 3) ?? []

  const firstName =
    profile?.firstname ||
    profile?.username ||
    user.email?.split("@")[0] ||
    "there"

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Welcome */}
        <div>
          <p className="text-sm text-gray-500">
            Welcome back
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Hello, {firstName} 👋
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your bookings and discover your next experience.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Bookings
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalBookings}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Confirmed Bookings
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {confirmedBookings}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Account
            </p>

            <p className="mt-2 truncate text-lg font-semibold text-gray-900">
              {user.email}
            </p>
          </div>

        </div>

        {/* Quick actions */}
        <div className="mt-8">

          <h2 className="text-xl font-bold text-gray-900">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Link
              href="/user"
              className="rounded-2xl bg-black p-6 text-white transition hover:bg-gray-800"
            >
              <h3 className="text-lg font-semibold">
                Explore
              </h3>

              <p className="mt-2 text-sm text-gray-300">
                Discover stays, events, services and activities.
              </p>
            </Link>

            <Link
              href="/user/bookings"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                My Bookings
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                View your stays, events and activities.
              </p>
            </Link>

            <Link
              href="/user/saved"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Saved Listings
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Quickly access listings you've saved.
              </p>
            </Link>

          </div>
        </div>
        

        {/* Recent bookings */}
        <div className="mt-10">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest activity on Odini.
              </p>
            </div>

            {totalBookings > 0 && (
              <Link
                href="/user/bookings"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                View all
              </Link>
            )}

          </div>

          {recentBookings.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-white p-8 text-center shadow-sm">

              <h3 className="font-semibold text-gray-900">
                No bookings yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Start exploring and book your first experience.
              </p>

              <Link
                href="/user"
                className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Explore Listings
              </Link>

            </div>
          ) : (
            <div className="mt-4 space-y-4">

              {recentBookings.map((booking) => {

                const listing = one(booking.listings)

                const type =
                  listing?.listing_type

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >

                    {/* Image */}
                    {listing?.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="h-20 w-full rounded-xl object-cover sm:h-20 sm:w-24"
                      />
                    ) : (
                      <div className="flex h-20 w-full items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400 sm:w-24">
                        No image
                      </div>
                    )}

                    {/* Information */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                          {type ?? "booking"}
                        </span>

                        <span className="text-xs text-gray-400">
                          {booking.booking_reference}
                        </span>

                      </div>

                      <h3 className="mt-2 truncate font-semibold text-gray-900">
                        {listing?.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {booking.quantity}{" "}
                        {booking.quantity === 1
                          ? "person"
                          : "people"}
                      </p>

                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between gap-4 sm:block sm:text-right">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status}
                      </span>

                      <p className="mt-2 font-semibold text-gray-900">
                        ZMK{" "}
                        {(
                          booking.amount_paid ?? 0
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>
                )
              })}

            </div>
          )}

        </div>

      </div>
    </main>
  )
}