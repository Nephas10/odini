import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Bookmark, CalendarCheck, Compass, Store } from "lucide-react"

// Supabase types the joined listing as a list, but it returns one object
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

// Events count tickets (quantity); stays and activities count guests
function peopleLabel(type: string | undefined, quantity: number, guests: number | null) {
  if (type === "event") return `${quantity} ${quantity === 1 ? "ticket" : "tickets"}`
  const count = guests ?? quantity
  return `${count} ${count === 1 ? "person" : "people"}`
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-[#D4A64A]/15 text-[#8A6A1F]",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/user/dashboard")
  }

  // Profile (role decides what the host card says)
  const { data: profile } = await supabase
    .from("profiles")
    .select("firstname, lastname, username, role")
    .eq("id", user.id)
    .single()

  const isHost = profile?.role === "host"

  // Bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_reference,
      quantity,
      guests,
      status,
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
  const confirmedBookings = bookings?.filter((b) => b.status === "confirmed").length ?? 0
  const pendingBookings = bookings?.filter((b) => b.status === "pending").length ?? 0
  const recentBookings = bookings?.slice(0, 3) ?? []

  const firstName =
    profile?.firstname || profile?.username || user.email?.split("@")[0] || "there"

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Welcome band */}
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F7EDEF]/80">
            Welcome back
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">Hello, {firstName} </h1>
          <p className="mt-2 text-[#F7EDEF]/90">
            Manage your bookings and discover your next experience.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        {/* Stats, pulled up over the band */}
        <div className="-mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total bookings", value: totalBookings },
            { label: "Confirmed", value: confirmedBookings },
            { label: "Waiting for host", value: pendingBookings },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-md">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-[#7A1F2B]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Host on ODINI */}
        <Link
          href={isHost ? "/host" : "/host/become"}
          className="group mt-8 flex flex-col gap-4 rounded-2xl border border-[#D4A64A]/40 bg-gradient-to-r from-[#7A1F2B] to-[#5E1721] p-6 text-white shadow-sm transition hover:shadow-lg sm:flex-row sm:items-center"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4A64A]/20 text-[#D4A64A]">
            <Store size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {isHost ? "Go to your host dashboard" : "Have a place, event or activity to share?"}
            </h2>
            <p className="mt-1 text-sm text-[#F7EDEF]/85">
              {isHost
                ? "Manage your listings and the bookings coming in."
                : "List it on ODINI and get bookings straight to your WhatsApp."}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#D4A64A] px-5 py-2.5 text-sm font-semibold text-[#3D0F15] transition group-hover:gap-3 sm:self-center">
            {isHost ? "Open host side" : "List your place"}
            <ArrowRight size={16} />
          </span>
        </Link>

        {/* Quick actions */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">Quick actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                href: "/user",
                icon: Compass,
                title: "Explore",
                text: "Discover stays, events and activities.",
              },
              {
                href: "/user/bookings",
                icon: CalendarCheck,
                title: "My bookings",
                text: "View your stays, events and activities.",
              },
              {
                href: "/user/saved",
                icon: Bookmark,
                title: "Saved listings",
                text: "Quickly access listings you've saved.",
              },
            ].map(({ href, icon: Icon, title, text }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Icon size={22} className="text-[#7A1F2B]" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-[#7A1F2B]">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{text}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent bookings</h2>
              <p className="mt-1 text-sm text-gray-500">Your latest activity on ODINI.</p>
            </div>
            {totalBookings > 0 && (
              <Link
                href="/user/bookings"
                className="text-sm font-medium text-[#7A1F2B] hover:underline"
              >
                View all
              </Link>
            )}
          </div>

          {recentBookings.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[#7A1F2B]/30 bg-white p-8 text-center">
              <h3 className="font-semibold text-gray-900">No bookings yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Start exploring and book your first experience.
              </p>
              <Link
                href="/user"
                className="mt-5 inline-block rounded-xl bg-[#7A1F2B] px-5 py-3 text-sm font-medium text-white hover:bg-[#5E1721]"
              >
                Explore listings
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {recentBookings.map((booking) => {
                const listing = one(booking.listings)
                const type = listing?.listing_type

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
                        className="h-20 w-full rounded-xl object-cover sm:w-24"
                      />
                    ) : (
                      <div className="flex h-20 w-full items-center justify-center rounded-xl bg-[#F7EDEF] text-xs text-[#7A1F2B]/60 sm:w-24">
                        No photo
                      </div>
                    )}

                    {/* Information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#F7EDEF] px-2.5 py-1 text-xs font-medium capitalize text-[#7A1F2B]">
                          {type ?? "booking"}
                        </span>
                        <span className="text-xs text-gray-400">{booking.booking_reference}</span>
                      </div>
                      <h3 className="mt-2 truncate font-semibold text-gray-900">
                        {listing?.title ?? "Listing no longer available"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {peopleLabel(type, booking.quantity, booking.guests)}
                      </p>
                    </div>

                    {/* Status */}
                    <span
                      className={`self-start rounded-full px-3 py-1 text-xs font-medium capitalize sm:self-center ${
                        STATUS_STYLES[booking.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {booking.status}
                    </span>
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