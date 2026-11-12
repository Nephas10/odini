
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Inbox,
  LayoutList,
  Sparkles,
  XCircle,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import HostBookingCard, { type HostBooking } from "./HostBookingCard"

// Supabase may return the joined listing as an array.
function one<T>(
  value: T | T[] | null | undefined
): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

const TABS = [
  {
    value: "pending",
    label: "Waiting",
    icon: Clock3,
  },
  {
    value: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
  },
  {
    value: "all",
    label: "All bookings",
    icon: LayoutList,
  },
] as const

type Tab = (typeof TABS)[number]["value"]

const EMPTY_TEXT: Record<Tab, string> = {
  pending:
    "You're all caught up! New booking requests will appear here.",
  confirmed:
    "No confirmed bookings yet. Accepted requests will appear here.",
  cancelled:
    "No cancelled bookings to display.",
  all:
    "You haven't received any bookings yet.",
}

type Props = {
  searchParams: Promise<{ status?: string }>
}

export default async function HostBookingsPage({
  searchParams,
}: Props) {
  const { status } = await searchParams

  const tab: Tab = TABS.some(
    (item) => item.value === status
  )
    ? (status as Tab)
    : "pending"

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/host/bookings")
  }

  // Keep the existing host-specific booking query.
  const { data: rows, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_reference,
      status,
      payment_status,
      payment_method,
      check_in,
      check_out,
      nights,
      booking_date,
      guests,
      quantity,
      customer_name,
      customer_phone,
      created_at,
      listings!inner (
        title,
        listing_type,
        price,
        host_id
      )
    `)
    .eq("listings.host_id", user.id)
    .order("created_at", { ascending: false })

  const bookings: HostBooking[] = (rows ?? []).map(
    ({ listings, ...booking }) => {
      const listing = one(listings)

      return {
        ...booking,
        listing: listing
          ? {
              title: listing.title,
              listing_type: listing.listing_type,
              price: listing.price,
            }
          : null,
      }
    }
  )

  const counts: Record<Tab, number> = {
    pending: bookings.filter(
      (booking) => booking.status === "pending"
    ).length,

    confirmed: bookings.filter(
      (booking) => booking.status === "confirmed"
    ).length,

    cancelled: bookings.filter(
      (booking) => booking.status === "cancelled"
    ).length,

    all: bookings.length,
  }

  const shown =
    tab === "all"
      ? bookings
      : bookings.filter(
          (booking) => booking.status === tab
        )

  const stats = [
    {
      label: "Total Requests",
      value: counts.all,
      description: "All booking requests",
      icon: LayoutList,
      background: "bg-[#F7EDEF]",
      color: "text-[#7A1F2B]",
    },
    {
      label: "Waiting",
      value: counts.pending,
      description: "Needs your attention",
      icon: Clock3,
      background: "bg-amber-50",
      color: "text-amber-700",
    },
    {
      label: "Confirmed",
      value: counts.confirmed,
      description: "Accepted reservations",
      icon: CheckCircle2,
      background: "bg-emerald-50",
      color: "text-emerald-700",
    },
    {
      label: "Cancelled",
      value: counts.cancelled,
      description: "Cancelled requests",
      icon: XCircle,
      background: "bg-red-50",
      color: "text-red-700",
    },
  ]

  const heading =
    tab === "pending"
      ? "Waiting for confirmation"
      : tab === "confirmed"
        ? "Confirmed bookings"
        : tab === "cancelled"
          ? "Cancelled bookings"
          : "All booking requests"

  return (
    <main className="min-h-screen bg-[#F8F7F7]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#3D0F15]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#D4A64A]/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#A8384A]/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A64A]/20 bg-[#D4A64A]/10 px-3 py-1.5">
                <Sparkles
                  size={13}
                  className="text-[#D4A64A]"
                />

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#EBC778]">
                  Host Workspace
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your Bookings
                <span className="text-[#D4A64A]">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Stay on top of guest requests,
                manage confirmations, track payment
                statuses, and connect with guests.
              </p>
            </div>

            <Link
              href="/host/listings"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Manage Listings
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* STATISTICS */}
        <section
          aria-label="Booking overview"
          className="-mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#3D0F15]">
                      {error ? "—" : stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.background} ${stat.color}`}
                  >
                    <Icon size={21} strokeWidth={1.9} />
                  </div>
                </div>

                <p className="mt-4 text-xs text-gray-400">
                  {stat.description}
                </p>
              </div>
            )
          })}
        </section>

        {/* FILTER HEADER */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7A1F2B]">
                Booking Management
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#3D0F15]">
                {heading}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Review and manage requests from guests
                across your listings.
              </p>
            </div>

            {!error && (
              <span className="rounded-full border border-[#7A1F2B]/10 bg-white px-4 py-2 text-xs font-semibold text-[#7A1F2B]">
                {shown.length}{" "}
                {shown.length === 1
                  ? "booking"
                  : "bookings"}
              </span>
            )}
          </div>

          {/* STATUS TABS */}
          <nav
            aria-label="Filter bookings"
            className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm"
          >
            {TABS.map((item) => {
              const active = item.value === tab
              const Icon = item.icon

              return (
                <Link
                  key={item.value}
                  href={`/host/bookings?status=${item.value}`}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold transition sm:px-5 sm:text-sm ${
                    active
                      ? "bg-[#7A1F2B] text-white shadow-sm"
                      : "text-gray-500 hover:bg-[#F7EDEF] hover:text-[#7A1F2B]"
                  }`}
                >
                  <Icon size={16} />

                  {item.label}

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : item.value === "pending" &&
                            counts.pending > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {error ? "—" : counts[item.value]}
                  </span>
                </Link>
              )
            })}
          </nav>
        </section>

        {/* BOOKINGS */}
        <section className="mt-6">
          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600 shadow-sm"
            >
              Unable to load your bookings.
              Please refresh the page.
            </div>
          ) : shown.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#7A1F2B]/20 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7EDEF]">
                {tab === "pending" ? (
                  <CalendarCheck2
                    size={29}
                    className="text-[#7A1F2B]"
                  />
                ) : (
                  <Inbox
                    size={29}
                    className="text-[#7A1F2B]"
                  />
                )}
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#3D0F15]">
                {tab === "pending"
                  ? "All caught up!"
                  : "Nothing to display yet"}
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                {EMPTY_TEXT[tab]}
              </p>

              {tab !== "all" && counts.all > 0 && (
                <Link
                  href="/host/bookings?status=all"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
                >
                  View All Bookings
                  <ArrowUpRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {shown.map((booking) => (
                <HostBookingCard
                  key={booking.id}
                  booking={booking}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
