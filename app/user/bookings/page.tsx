
import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarDays, MapPin, Users,} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

// Supabase types joined listings as an array.
// Each booking belongs to one listing.
function one<T>(
  value: T | T[] | null | undefined
): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

// Booking data
type Booking = {
  id: string
  booking_reference: string | null
  booking_date: string | null
  check_in: string | null
  check_out: string | null
  nights: number | null
  guests: number | null
  quantity: number
  payment_method: string | null
  payment_status: string | null
  status: string
  created_at: string

  listing: {
    id: string
    title: string
    location: string | null
    price: number | null
    image_url: string | null
    listing_type: string
  } | null
}

// Booking filters
const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
] as const

type Tab = (typeof TABS)[number]["value"]

type Props = {
  searchParams: Promise<{
    status?: string
  }>
}

// Status styling
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#D4A64A]/15 text-[#E8BD70]",
  confirmed: "bg-green-500/15 text-green-400",
  cancelled: "bg-red-500/15 text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for host",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
}

// Format date: 2026-10-16 -> Fri 16 Oct
function day(date: string) {
  return new Date(
    `${date.slice(0, 10)}T12:00:00+02:00`
  ).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Africa/Lusaka",
  })
}

// Format date and time
function dateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lusaka",
  })
}

// Booking details based on listing type
function details(b: Booking) {
  const price = b.listing?.price ?? null
  const type = b.listing?.listing_type

  // Stay booking
  if (
    type === "stay" &&
    b.check_in &&
    b.check_out
  ) {
    const nights = b.nights ?? 1
    const guests = b.guests ?? 1

    return {
      when: `${day(b.check_in)} → ${day(b.check_out)}`,
      who: `${nights} ${
        nights === 1 ? "night" : "nights"
      } · ${guests} ${
        guests === 1 ? "guest" : "guests"
      }`,
      total:
        price !== null
          ? price * nights
          : null,
      date: b.check_in,
    }
  }

  // Event booking
  if (type === "event") {
    return {
      when: b.booking_date
        ? dateTime(b.booking_date)
        : "Date to be confirmed",

      who: `${b.quantity} ${
        b.quantity === 1 ? "ticket" : "tickets"
      }`,

      total:
        price !== null
          ? price * b.quantity
          : null,

      date: b.booking_date,
    }
  }

  // Activity booking
  const people = b.guests ?? b.quantity

  return {
    when: b.booking_date
      ? day(b.booking_date)
      : "Date to be confirmed",

    who: `${people} ${
      people === 1 ? "person" : "people"
    }`,

    total:
      price !== null
        ? price * people
        : null,

    date: b.booking_date,
  }
}

// Current date in Zambia
function todayInZambia() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Lusaka",
  })
}

// Individual booking card
function BookingCard({
  booking,
}: {
  booking: Booking
}) {
  const listing = booking.listing

  const { when, who, total } = details(booking)

  const isPaid =
    booking.payment_status === "paid"

  return (
    <article className="rounded-2xl border border-white/10 bg-[#1C1A1D] p-4 shadow-sm sm:p-5">

      {/* Listing information */}
      <div className="flex gap-4">

        {/* Listing image */}
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#242024] sm:h-24 sm:w-32">

          {listing?.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-white/40">
              No photo
            </div>
          )}

        </div>

        <div className="min-w-0 flex-1">

          {/* Booking and payment statuses */}
          <div className="flex flex-wrap items-center gap-1.5">

            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                STATUS_STYLES[booking.status] ??
                "bg-white/10 text-white/60"
              }`}
            >
              {STATUS_LABEL[booking.status] ??
                booking.status}
            </span>

            {booking.status !== "cancelled" && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isPaid
                    ? "bg-green-500/15 text-green-400"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {isPaid
                  ? "Paid"
                  : "Not paid yet"}
              </span>
            )}

          </div>

          {/* Listing title */}
          <h2 className="mt-1.5 line-clamp-2 text-base font-semibold leading-snug text-white">
            {listing?.title ??
              "Listing no longer available"}
          </h2>

          {/* Location */}
          {listing?.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
              <MapPin
                size={12}
                className="shrink-0 text-[#FF8CA5]"
              />

              <span className="truncate">
                {listing.location}
              </span>
            </p>
          )}

        </div>
      </div>

      {/* Booking details */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-[#242024] p-3 text-sm">

        {/* Date */}
        <div className="col-span-2 flex items-start gap-2 sm:col-span-1">
          <CalendarDays
            size={16}
            className="mt-0.5 shrink-0 text-[#FF8CA5]"
          />

          <div>
            <dt className="sr-only">When</dt>

            <dd className="font-medium text-white">
              {when}
            </dd>
          </div>
        </div>

        {/* Guests / tickets */}
        <div className="col-span-2 flex items-start gap-2 sm:col-span-1">
          <Users
            size={16}
            className="mt-0.5 shrink-0 text-[#FF8CA5]"
          />

          <div>
            <dt className="sr-only">
              Booked for
            </dt>

            <dd className="font-medium text-white">
              {who}
            </dd>
          </div>
        </div>

        {/* Booking reference */}
        <div className="min-w-0">
          <dt className="text-xs text-white/50">
            Reference
          </dt>

          <dd className="break-all font-mono text-sm font-semibold text-white">
            {booking.booking_reference ?? "-"}
          </dd>
        </div>

        {/* Total price */}
        <div className="text-right">
          <dt className="text-xs text-white/50">
            Total ·{" "}
            {booking.payment_method === "card"
              ? "card"
              : "mobile money"}
          </dt>

          <dd className="text-base font-bold text-[#FF8CA5]">
            {total !== null
              ? `K${total.toLocaleString("en-ZM")}`
              : "On request"}
          </dd>
        </div>

      </dl>

      {/* View listing */}
      {listing?.id && (
        <Link
          href={`/user/listings/${listing.id}`}
          className="mt-3 block rounded-xl border border-white/15 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
        >
          View listing
        </Link>
      )}

    </article>
  )
}

// Main My Bookings page
export default async function MyBookingsPage({
  searchParams,
}: Props) {

  // Read selected filter from URL
  const { status } = await searchParams

  const tab: Tab = TABS.some(
    (t) => t.value === status
  )
    ? (status as Tab)
    : "all"

  const supabase = await createClient()

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      "/auth/login?next=/user/bookings"
    )
  }

  // Fetch bookings belonging to this guest
  const { data: rows, error } = await supabase
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
      payment_method,
      payment_status,
      status,
      created_at,
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
    .order("created_at", {
      ascending: false,
    })

  if (error) {
    console.error(
      "Error fetching bookings:",
      error.message
    )
  }

  // Normalize joined listing
  const bookings: Booking[] = (
    rows ?? []
  ).map(({ listings, ...booking }) => ({
    ...booking,
    listing: one(listings),
  }))

  // Calculate counts for filter tabs
  const counts: Record<Tab, number> = {
    all: bookings.length,

    pending: bookings.filter(
      (b) => b.status === "pending"
    ).length,

    confirmed: bookings.filter(
      (b) => b.status === "confirmed"
    ).length,

    cancelled: bookings.filter(
      (b) => b.status === "cancelled"
    ).length,
  }

  // Apply selected booking filter
  const filteredBookings =
    tab === "all"
      ? bookings
      : bookings.filter(
          (b) => b.status === tab
        )

  // Upcoming and past bookings
  const today = todayInZambia()

  const isUpcoming = (b: Booking) => {
    const date = details(b).date

    return (
      b.status !== "cancelled" &&
      (!date || date.slice(0, 10) >= today)
    )
  }

  const upcoming =
    filteredBookings.filter(isUpcoming)

  const past = filteredBookings.filter(
    (b) => !isUpcoming(b)
  )

  return (
    <main className="min-h-screen bg-[#121012] text-white">

      {/* Page header */}
      <section>
        <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">

          <span className="inline-flex items-center rounded-full border border-[#e8365d]/20 bg-[#e8365d]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#FF8CA5]">
            My account
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            My bookings
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/50 sm:text-base">
            Your stays, events and activities
            in one place.
          </p>

        </div>
      </section>

      {/* Page content */}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">

        {/* Booking filters */}
        <nav
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
          aria-label="Filter my bookings"
        >
          {TABS.map((t) => {
            const active =
              tab === t.value

            return (
              <Link
                key={t.value}
                href={`/user/bookings?status=${t.value}`}
                aria-current={
                  active ? "page" : undefined
                }
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-[#e8365d] text-white"
                    : "border border-white/10 bg-[#1C1A1D] text-white/60 hover:border-[#e8365d] hover:text-white"
                }`}
              >
                {t.label}

                {/* Tab booking count */}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {counts[t.value]}
                </span>

              </Link>
            )
          })}
        </nav>

        {/* Database error */}
        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-white/10 bg-[#1C1A1D] p-8 text-center text-sm text-red-400 shadow-sm"
          >
            Unable to load your bookings.
            Please refresh the page and try again.
          </div>
        ) : filteredBookings.length === 0 ? (

          /* Empty state */
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#1C1A1D] p-8 text-center">

            <CalendarDays
              size={36}
              className="mx-auto text-[#FF8CA5]/50"
            />

            <h2 className="mt-4 text-lg font-semibold text-white">
              {tab === "all"
                ? "No bookings yet"
                : `No ${tab} bookings`}
            </h2>

            <p className="mt-2 text-sm text-white/50">
              {tab === "all"
                ? "Your bookings will appear here once you make one."
                : "You don't have any bookings with this status."}
            </p>

            <Link
              href={
                tab === "all"
                  ? "/user"
                  : "/user/bookings"
              }
              className="mt-5 inline-block rounded-full bg-[#e8365d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d02d50]"
            >
              {tab === "all"
                ? "Explore listings"
                : "View all bookings"}
            </Link>

          </div>

        ) : tab !== "all" ? (

          /* Filtered bookings */
          <div className="space-y-3">

            {filteredBookings.map(
              (booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                />
              )
            )}

          </div>

        ) : (

          /* All bookings */
          <div className="space-y-8">

            {/* Upcoming bookings */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                Upcoming ({upcoming.length})
              </h2>

              {upcoming.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-white/10 bg-[#1C1A1D] p-5 text-sm text-white/50 shadow-sm">
                  Nothing coming up.{" "}

                  <Link
                    href="/user"
                    className="font-semibold text-[#FF8CA5] hover:underline"
                  >
                    Find something to do
                  </Link>
                </p>
              ) : (
                <div className="mt-3 space-y-3">

                  {upcoming.map(
                    (booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                      />
                    )
                  )}

                </div>
              )}
            </section>

            {/* Past and cancelled bookings */}
            {past.length > 0 && (
              <section>

                <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                  Past and cancelled ({past.length})
                </h2>

                <div className="mt-3 space-y-3 opacity-80">

                  {past.map(
                    (booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                      />
                    )
                  )}

                </div>

              </section>
            )}

          </div>
        )}

      </div>
    </main>
  )
}
