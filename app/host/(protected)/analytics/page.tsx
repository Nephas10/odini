
import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  ChartNoAxesCombined,
  Info,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import BookingInsights from "./BookingInsights"

// ---------------------------------------
// TYPES
// ---------------------------------------

type Props = {
  searchParams: Promise<{
    period?: string
    listing?: string
  }>
}

// ---------------------------------------
// ANALYTICS PAGE
// ---------------------------------------

export default async function HostAnalyticsPage({
  searchParams,
}: Props) {
  const { period, listing } = await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/host/analytics")
  }

  // ---------------------------------------
  // ALL-TIME BOOKING STATISTICS
  // ---------------------------------------

  // Count only bookings belonging to this host.
  const bookingCount = () =>
    supabase
      .from("bookings")
      .select("id, listings!inner(host_id)", {
        count: "exact",
        head: true,
      })
      .eq("listings.host_id", user.id)

  const [
    totalResult,
    pendingResult,
    confirmedResult,
    cancelledResult,
  ] = await Promise.all([
    bookingCount(),

    bookingCount().eq(
      "status",
      "pending"
    ),

    bookingCount().eq(
      "status",
      "confirmed"
    ),

    bookingCount().eq(
      "status",
      "cancelled"
    ),
  ])

  const hasError = [
    totalResult,
    pendingResult,
    confirmedResult,
    cancelledResult,
  ].some((result) => result.error !== null)

  if (hasError) {
    console.error(
      "Host analytics statistics failed:",
      {
        total: totalResult.error?.message,
        pending: pendingResult.error?.message,
        confirmed: confirmedResult.error?.message,
        cancelled: cancelledResult.error?.message,
      }
    )
  }

  const stats = [
    {
      label: "Total Requests",
      value: totalResult.error
        ? "—"
        : totalResult.count ?? 0,
      description: "All booking requests received",
      icon: CalendarDays,
      color: "text-[#7A1F2B]",
      background: "bg-[#F7EDEF]",
    },
    {
      label: "Pending",
      value: pendingResult.error
        ? "—"
        : pendingResult.count ?? 0,
      description: "Awaiting host confirmation",
      icon: Clock3,
      color: "text-amber-700",
      background: "bg-amber-50",
    },
    {
      label: "Confirmed",
      value: confirmedResult.error
        ? "—"
        : confirmedResult.count ?? 0,
      description: "Currently confirmed bookings",
      icon: CheckCircle2,
      color: "text-emerald-700",
      background: "bg-emerald-50",
    },
    {
      label: "Cancelled",
      value: cancelledResult.error
        ? "—"
        : cancelledResult.count ?? 0,
      description: "Cancelled booking requests",
      icon: XCircle,
      color: "text-red-700",
      background: "bg-red-50",
    },
  ]

  // ---------------------------------------
  // PAGE LAYOUT
  // ---------------------------------------

  return (
    <main className="min-h-screen bg-[#F8F7F7]">
      {/* HEADER */}
      <section className="relative overflow-hidden bg-[#3D0F15]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#D4A64A]/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-[#A8384A]/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A64A]/20 bg-[#D4A64A]/10 px-3 py-1.5 text-xs font-semibold text-[#EBC778]">
                <ChartNoAxesCombined size={15} />

                Business Insights
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Host Analytics
                <span className="text-[#D4A64A]">
                  .
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Understand your booking activity,
                monitor performance, and discover
                which listings attract the most
                interest on Odini.
              </p>
            </div>

            <Link
              href="/host/bookings"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Manage Bookings

              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* ALL-TIME STATISTICS */}
        <section
          aria-label="Booking statistics"
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
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.background} ${stat.color}`}
                  >
                    <Icon
                      size={21}
                      strokeWidth={1.9}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-gray-400">
                  {stat.description}
                </p>
              </div>
            )
          })}
        </section>

        {/* STATISTICS ERROR */}
        {hasError && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Some booking statistics could not be loaded.
            Please check the host booking access
            policies and try again.
          </div>
        )}

        {/* ANALYTICS EXPLANATION */}
        <section className="mt-7 flex items-start gap-3 rounded-2xl border border-[#7A1F2B]/10 bg-white px-5 py-4">
          <Info
            size={19}
            className="mt-0.5 shrink-0 text-[#7A1F2B]"
          />

          <div>
            <h2 className="text-sm font-bold text-[#3D0F15]">
              Understanding your analytics
            </h2>

            <p className="mt-1 text-xs leading-6 text-gray-500">
              The statistics above show your all-time
              booking activity. Use the filters below
              to explore trends and listing performance
              over a specific period.
            </p>
          </div>
        </section>

        {/* FILTERS, CHART AND TOP LISTINGS */}
        <BookingInsights
          period={period}
          listingId={listing}
        />

      </div>
    </main>
  )
}
