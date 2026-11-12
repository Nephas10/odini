
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Filter,
  Trophy,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

// ---------------------------------------
// TYPES
// ---------------------------------------

type Props = {
  period?: string
  listingId?: string
}

type BookingRow = {
  listingId: string
  listingTitle: string
  listingType: string
  status: string
  createdAt: string
}

type MonthStat = {
  key: string
  label: string
  requests: number
  confirmed: number
}

type ListingStat = {
  id: string
  title: string
  type: string
  requests: number
  confirmed: number
  cancelled: number
}

const PAGE_SIZE = 500

// ---------------------------------------
// DATE HELPERS
// ---------------------------------------

// Use Zambia's local month when grouping bookings.
const zambiaMonthFormatter = new Intl.DateTimeFormat(
  "en-US",
  {
    timeZone: "Africa/Lusaka",
    year: "numeric",
    month: "2-digit",
  }
)

function monthKeyInZambia(date: Date): string {
  const parts = zambiaMonthFormatter.formatToParts(date)

  const year = parts.find(
    (part) => part.type === "year"
  )?.value

  const month = parts.find(
    (part) => part.type === "month"
  )?.value

  return `${year}-${month}`
}

function getMonths(count: number): MonthStat[] {
  const [year, month] = monthKeyInZambia(new Date())
    .split("-")
    .map(Number)

  return Array.from(
    { length: count },
    (_, index) => {
      const date = new Date(
        Date.UTC(
          year,
          month - 1 - (count - 1 - index),
          1
        )
      )

      return {
        key: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }),
        requests: 0,
        confirmed: 0,
      }
    }
  )
}

function barHeight(
  value: number,
  maximum: number
): string {
  if (value <= 0) return "0%"

  return `${Math.max(
    3,
    (value / maximum) * 100
  )}%`
}

// Supabase may return a joined listing as an array.
function one<T>(
  value: T | T[] | null | undefined
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

// ---------------------------------------
// MAIN COMPONENT
// ---------------------------------------

export default async function BookingInsights({
  period,
  listingId,
}: Props) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/host/analytics")
  }

  // Only allow supported reporting periods.
  const periodCount =
    period === "3"
      ? 3
      : period === "12"
        ? 12
        : 6

  const months = getMonths(periodCount)

  // ---------------------------------------
  // LOAD HOST LISTINGS FOR FILTER OPTIONS
  // ---------------------------------------

  const {
    data: hostListings,
    error: listingsError,
  } = await supabase
    .from("listings")
    .select("id, title")
    .eq("host_id", user.id)
    .order("title", { ascending: true })

  if (listingsError) {
    console.error(
      "Analytics listing query failed:",
      listingsError.message
    )

    return (
      <section
        role="alert"
        className="mt-10 rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-700"
      >
        Unable to load analytics filters.
        Please try again.
      </section>
    )
  }

  // Never accept a listing filter belonging to
  // another host.
  const requestedListingId = listingId ?? ""

  const validListing =
    !requestedListingId ||
    (hostListings ?? []).some(
      (listing) => listing.id === requestedListingId
    )

  if (!validListing) {
    return (
      <section
        role="alert"
        className="mt-10 rounded-2xl border border-red-100 bg-white p-6"
      >
        <p className="text-sm text-red-700">
          The selected listing is unavailable.
        </p>

        <Link
          href="/host/analytics"
          className="mt-4 inline-flex text-sm font-semibold text-[#7A1F2B] hover:underline"
        >
          Reset analytics
        </Link>
      </section>
    )
  }

  const selectedListingId = requestedListingId

  // First day of the oldest included month,
  // midnight in Zambia (UTC+02:00).
  const startDate = new Date(
    `${months[0].key}-01T00:00:00+02:00`
  ).toISOString()

  // ---------------------------------------
  // FETCH BOOKING DATA
  // ---------------------------------------

  const bookings: BookingRow[] = []
  let loadError: string | null = null

  // Fetch in pages so we don't silently lose
  // records beyond Supabase's default row limit.
  for (let offset = 0; ; offset += PAGE_SIZE) {
    let bookingQuery = supabase
      .from("bookings")
      .select(`
        id,
        listing_id,
        status,
        created_at,
        listings!inner (
          host_id,
          title,
          listing_type
        )
      `)
      .eq("listings.host_id", user.id)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })

    // Apply the selected listing filter.
    if (selectedListingId) {
      bookingQuery = bookingQuery.eq(
        "listing_id",
        selectedListingId
      )
    }

    // Execute the query with pagination.
    const { data, error } = await bookingQuery.range(
      offset,
      offset + PAGE_SIZE - 1
    )

    if (error) {
      console.error(
        "Booking insights query failed:",
        error.message
      )

      loadError = error.message
      break
    }

    const rows = data ?? []

    for (const row of rows) {
      const listing = one(row.listings)

      if (!listing) continue

      bookings.push({
        listingId: row.listing_id,
        listingTitle: listing.title,
        listingType: listing.listing_type,
        status: row.status,
        createdAt: row.created_at,
      })
    }

    if (rows.length < PAGE_SIZE) {
      break
    }
  }

  if (loadError) {
    return (
      <section
        role="alert"
        className="mt-10 rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-700"
      >
        Unable to load booking trends and listing
        performance. Please check your booking
        permissions and try again.
      </section>
    )
  }

  // ---------------------------------------
  // CALCULATE MONTHLY BOOKING TRENDS
  // ---------------------------------------

  const monthMap = new Map(
    months.map((month) => [month.key, month])
  )

  // ---------------------------------------
  // CALCULATE LISTING PERFORMANCE
  // ---------------------------------------

  const listingMap = new Map<string, ListingStat>()

  for (const booking of bookings) {
    const monthKey = monthKeyInZambia(
      new Date(booking.createdAt)
    )

    const month = monthMap.get(monthKey)

    if (!month) continue

    month.requests += 1

    if (booking.status === "confirmed") {
      month.confirmed += 1
    }

    if (!listingMap.has(booking.listingId)) {
      listingMap.set(booking.listingId, {
        id: booking.listingId,
        title: booking.listingTitle,
        type: booking.listingType,
        requests: 0,
        confirmed: 0,
        cancelled: 0,
      })
    }

    const listing = listingMap.get(
      booking.listingId
    )!

    listing.requests += 1

    if (booking.status === "confirmed") {
      listing.confirmed += 1
    }

    if (booking.status === "cancelled") {
      listing.cancelled += 1
    }
  }

  const topListings = Array.from(
    listingMap.values()
  )
    .sort(
      (a, b) =>
        b.requests - a.requests ||
        b.confirmed - a.confirmed ||
        a.title.localeCompare(b.title)
    )
    .slice(0, 5)

  const totalRequests = months.reduce(
    (sum, month) => sum + month.requests,
    0
  )

  const totalConfirmed = months.reduce(
    (sum, month) => sum + month.confirmed,
    0
  )

  const maximumMonthly = Math.max(
    1,
    ...months.map((month) => month.requests)
  )

  const maximumListing = Math.max(
    1,
    ...topListings.map(
      (listing) => listing.requests
    )
  )

  // Responsive chart width for different periods.
  const chartGridClass =
    periodCount === 3
      ? "grid min-w-[360px] grid-cols-3 gap-3"
      : periodCount === 12
        ? "grid min-w-[840px] grid-cols-12 gap-3"
        : "grid min-w-[420px] grid-cols-6 gap-3"

  // ---------------------------------------
  // RENDER ANALYTICS
  // ---------------------------------------

  return (
    <>
      {/* FILTER SECTION */}
      <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Filter
              size={20}
              className="text-[#7A1F2B]"
            />

            <h2 className="text-lg font-bold text-[#3D0F15]">
              Filter Analytics
            </h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Select a reporting period and listing
            to explore your booking performance.
          </p>
        </div>

        <form
          action="/host/analytics"
          method="GET"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end"
        >
          {/* REPORTING PERIOD */}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-gray-600">
              Reporting Period
            </span>

            <select
              name="period"
              defaultValue={String(periodCount)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/10"
            >
              <option value="3">
                Last 3 months
              </option>

              <option value="6">
                Last 6 months
              </option>

              <option value="12">
                Last 12 months
              </option>
            </select>
          </label>

          {/* LISTING FILTER */}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-gray-600">
              Select Listing
            </span>

            <select
              name="listing"
              defaultValue={selectedListingId}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none transition focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/10"
            >
              <option value="">
                All Listings
              </option>

              {(hostListings ?? []).map(
                (listing) => (
                  <option
                    key={listing.id}
                    value={listing.id}
                  >
                    {listing.title}
                  </option>
                )
              )}
            </select>
          </label>

          {/* APPLY */}
          <button
            type="submit"
            className="h-12 rounded-xl bg-[#7A1F2B] px-6 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
          >
            Apply Filters
          </button>

          {/* RESET */}
          <Link
            href="/host/analytics"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Reset
          </Link>
        </form>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Filters apply to the charts and listing
          performance below. The four main statistics
          above remain all-time totals.
        </p>
      </section>

      {/* BOOKING TRENDS + OVERVIEW */}
      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* BOOKING TRENDS */}
        <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3
                  size={21}
                  className="text-[#7A1F2B]"
                />

                <h2 className="text-lg font-bold text-[#3D0F15]">
                  Booking Trends
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Requests created during the last{" "}
                {periodCount} calendar months.
              </p>
            </div>

            <span className="rounded-full bg-[#F7EDEF] px-3 py-1.5 text-xs font-semibold text-[#7A1F2B]">
              Last {periodCount} months
            </span>
          </div>

          {/* CHART LEGEND */}
          <div className="mt-7 flex flex-wrap gap-5">
            <span className="flex items-center gap-2 text-xs text-gray-600">
              <span className="h-3 w-3 rounded bg-[#7A1F2B]" />
              Requests
            </span>

            <span className="flex items-center gap-2 text-xs text-gray-600">
              <span className="h-3 w-3 rounded bg-[#D4A64A]" />
              Currently confirmed
            </span>
          </div>

          {totalRequests === 0 ? (
            <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 text-center">
              <CalendarDays
                size={30}
                className="text-[#7A1F2B]/50"
              />

              <h3 className="mt-4 font-semibold text-gray-900">
                No bookings in this period
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                New booking requests will appear
                here as guests use Odini.
              </p>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto pb-2">
              <div className={chartGridClass}>
                {months.map((month) => (
                  <div
                    key={month.key}
                    className="flex min-w-0 flex-col items-center"
                  >
                    <p className="mb-3 text-xs font-bold text-gray-700">
                      {month.requests}
                    </p>

                    <div className="flex h-40 w-full items-end justify-center gap-1.5 border-b border-gray-200">
                      {/* REQUESTS BAR */}
                      <div
                        title={`${month.requests} requests`}
                        className="w-6 rounded-t-md bg-[#7A1F2B]"
                        style={{
                          height: barHeight(
                            month.requests,
                            maximumMonthly
                          ),
                        }}
                      />

                      {/* CONFIRMED BAR */}
                      <div
                        title={`${month.confirmed} confirmed`}
                        className="w-6 rounded-t-md bg-[#D4A64A]"
                        style={{
                          height: barHeight(
                            month.confirmed,
                            maximumMonthly
                          ),
                        }}
                      />
                    </div>

                    <p className="mt-3 whitespace-nowrap text-xs font-semibold text-gray-600">
                      {month.label}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      {month.confirmed} confirmed
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PERIOD OVERVIEW */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarDays
              size={21}
              className="text-[#7A1F2B]"
            />

            <h2 className="font-bold text-[#3D0F15]">
              Period Overview
            </h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Summary for the selected{" "}
            {periodCount}-month period.
          </p>

          <div className="mt-8 rounded-xl bg-[#F7EDEF] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7A1F2B]/70">
              Booking Requests
            </p>

            <p className="mt-2 text-4xl font-bold text-[#3D0F15]">
              {totalRequests}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Currently Confirmed
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {totalConfirmed}
            </p>
          </div>

          <p className="mt-5 text-xs leading-6 text-gray-500">
            Bookings are grouped by request creation
            month and current status. These figures
            do not represent payments, completed
            stays, or revenue.
          </p>
        </div>
      </section>

      {/* TOP PERFORMING LISTINGS */}
      <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy
                size={21}
                className="text-[#D4A64A]"
              />

              <h2 className="text-lg font-bold text-[#3D0F15]">
                Top Performing Listings
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Ranked by booking requests received
              in the last {periodCount} months.
            </p>
          </div>

          <Link
            href="/host/listings"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#7A1F2B] transition hover:bg-[#F7EDEF]"
          >
            Manage Listings
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {topListings.length === 0 ? (
          <div className="mt-7 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="font-semibold text-gray-800">
              No listing performance data yet
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Listings that receive bookings during
              this period will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {topListings.map((listing, index) => (
              <div
                key={listing.id}
                className="rounded-xl border border-gray-100 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7EDEF] text-sm font-bold text-[#7A1F2B]">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="break-words font-bold text-[#3D0F15]">
                        {listing.title}
                      </p>

                      <p className="mt-1 text-xs capitalize text-gray-500">
                        {listing.type}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-[#7A1F2B]">
                      {listing.requests}
                    </p>

                    <p className="text-xs text-gray-500">
                      {listing.requests === 1
                        ? "request"
                        : "requests"}
                    </p>
                  </div>
                </div>

                {/* PERFORMANCE BAR */}
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#7A1F2B]"
                    style={{
                      width: `${
                        (listing.requests /
                          maximumListing) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="font-medium text-emerald-700">
                      {listing.confirmed} confirmed
                    </span>

                    <span className="font-medium text-red-600">
                      {listing.cancelled} cancelled
                    </span>
                  </div>

                  <Link
                    href={`/host/listings/${listing.id}/edit`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A1F2B] hover:underline"
                  >
                    View Listing
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
