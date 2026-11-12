
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileText,
  ImageIcon,
  Layers3,
  Plus,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const PRICE_UNIT: Record<string, string> = {
  stay: "/ night",
  event: "/ ticket",
  activity: "/ person",
}

export default async function HostDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/host")
  }

  const [
    { data: profile },
    { data: listings, error: listingsError },
    { data: pending, error: pendingError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("business_name, firstname")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("listings")
      .select(
        "id, title, listing_type, price, is_active, image_url, created_at"
      )
      .eq("host_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("bookings")
      .select("id, listings!inner(host_id)")
      .eq("listings.host_id", user.id)
      .eq("status", "pending"),
  ])

  const hostListings = listings ?? []

  const totalListings = hostListings.length
  const activeListings = hostListings.filter(
    (listing) => listing.is_active
  ).length

  const draftListings = totalListings - activeListings

  const pendingBookings = pendingError
    ? null
    : pending?.length ?? 0

  const name =
    profile?.business_name?.trim() ||
    profile?.firstname?.trim() ||
    "Host"

  const stats = [
    {
      label: "Total Listings",
      value: totalListings,
      description: "All your listings",
      icon: Layers3,
      iconStyle: "bg-[#F7EDEF] text-[#7A1F2B]",
    },
    {
      label: "Active Listings",
      value: activeListings,
      description: "Currently published",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Draft Listings",
      value: draftListings,
      description: "Not yet published",
      icon: FileText,
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      label: "Pending Bookings",
      value: pendingBookings ?? "—",
      description: pendingError
        ? "Unable to load"
        : "Awaiting your response",
      icon: CalendarCheck,
      iconStyle: "bg-blue-50 text-blue-700",
    },
  ]

  return (
    <main className="min-h-screen bg-[#F8F7F7]">

      {/* HERO / WELCOME */}
      <section className="relative overflow-hidden bg-[#3D0F15]">

        {/* Background decorations */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#D4A64A]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#A8384A]/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8">

          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            {/* Welcome message */}
            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A64A]/20 bg-[#D4A64A]/10 px-3 py-1.5">
                <Sparkles size={13} className="text-[#D4A64A]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#EBC778]">
                  Your host workspace
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Welcome back,
                <span className="mt-1 block text-[#EBC778]">
                  {name}
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Everything you need to manage your listings,
                stay on top of booking requests, and grow your
                business on Odini.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">

                <Link
                  href="/host/listings/new"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#D4A64A] px-5 py-3 text-sm font-bold text-[#3D0F15] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#E7BD67]"
                >
                  <Plus size={18} />
                  Create Listing
                </Link>

                <Link
                  href="/host/bookings"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  View Bookings
                  <ArrowUpRight size={16} />
                </Link>

              </div>
            </div>

            {/* Welcome information card */}
            <div className="hidden w-full max-w-[280px] rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm lg:block">

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4A64A]/15">
                  <Layers3
                    size={17}
                    className="text-[#D4A64A]"
                  />
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Business overview
                </p>
              </div>

              <div className="mt-6">
                <p className="text-4xl font-bold tracking-tight text-white">
                  {totalListings}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Total listings on Odini
                </p>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">
                    Published
                  </span>
                  <span className="text-sm font-semibold text-[#EBC778]">
                    {activeListings}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-white/60">
                    Unpublished drafts
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {draftListings}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* DASHBOARD CONTENT */}
      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* STATS */}
        <section
          aria-label="Business statistics"
          className="-mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6"
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
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.iconStyle}`}
                  >
                    <Icon size={21} strokeWidth={1.9} />
                  </div>

                </div>

                <p className="mt-4 text-xs text-gray-400">
                  {stat.description}
                </p>

                <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#7A1F2B]/40 to-transparent" />
              </div>
            )
          })}
        </section>

        {/* PENDING BOOKINGS ALERT */}
        {pendingError ? (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm text-red-700">
              We couldn't load your pending booking count.
              You can still review requests in Bookings.
            </p>

            <Link
              href="/host/bookings"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F2B]"
            >
              Open Bookings
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : pendingBookings !== null &&
          pendingBookings > 0 ? (
          <Link
            href="/host/bookings"
            className="group mt-7 flex flex-col gap-4 rounded-2xl border border-[#D4A64A]/30 bg-[#FFF9EC] p-5 transition-all hover:border-[#D4A64A]/70 hover:shadow-sm sm:flex-row sm:items-center sm:p-6"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4A64A]/20 text-[#7A1F2B]">
              <Clock3 size={23} />
            </div>

            <div className="flex-1">
              <h2 className="text-sm font-bold text-[#3D0F15] sm:text-base">
                {pendingBookings} booking{" "}
                {pendingBookings === 1
                  ? "request needs"
                  : "requests need"}{" "}
                your attention
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                You have pending requests waiting for a response.
                Review them to keep guests informed.
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#7A1F2B]">
              Review Requests
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>
        ) : (
          <div className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-4">
            <CheckCircle2
              size={20}
              className="shrink-0 text-emerald-700"
            />

            <p className="text-sm text-emerald-900">
              You're all caught up! No booking requests
              are currently waiting for confirmation.
            </p>
          </div>
        )}

        {/* RECENT LISTINGS */}
        <section className="mt-12">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7A1F2B]">
                Your business
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#3D0F15]">
                Recent Listings
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Keep your properties, events, and activities
                up to date.
              </p>
            </div>

            {totalListings > 0 && (
              <Link
                href="/host/listings"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#7A1F2B] transition hover:border-[#7A1F2B]/30 hover:bg-[#F7EDEF]"
              >
                View All Listings
                <ArrowUpRight size={16} />
              </Link>
            )}

          </div>

          {listingsError ? (
            <div className="mt-6 rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600">
              Unable to load your listings. Please try again.
            </div>
          ) : totalListings > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {hostListings.slice(0, 6).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/host/listings/${listing.id}/edit`}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-[#7A1F2B]/20 hover:shadow-xl hover:shadow-[#3D0F15]/[0.06]"
                >

                  {/* Listing image */}
                  <div className="relative h-44 overflow-hidden bg-[#F7EDEF]">

                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-[#7A1F2B]/50">
                        <ImageIcon size={30} strokeWidth={1.5} />

                        <span className="text-xs font-medium">
                          No photo added yet
                        </span>
                      </div>
                    )}

                    {/* Status */}
                    <span
                      className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ${
                        listing.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-white/95 text-gray-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          listing.is_active
                            ? "bg-emerald-500"
                            : "bg-gray-400"
                        }`}
                      />

                      {listing.is_active
                        ? "Published"
                        : "Draft"}
                    </span>

                  </div>

                  {/* Listing info */}
                  <div className="p-5">

                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A1F2B]">
                      {listing.listing_type}
                    </span>

                    <h3 className="mt-2 truncate text-base font-bold text-[#3D0F15] transition-colors group-hover:text-[#7A1F2B]">
                      {listing.title}
                    </h3>

                    <div className="mt-3 flex items-baseline gap-1">

                      <span className="text-lg font-bold text-gray-900">
                        {listing.price != null
                          ? `K${listing.price.toLocaleString("en-ZM")}`
                          : "Price on request"}
                      </span>

                      {listing.price != null &&
                        PRICE_UNIT[listing.listing_type] && (
                          <span className="text-xs text-gray-400">
                            {PRICE_UNIT[listing.listing_type]}
                          </span>
                        )}

                    </div>

                    {/* Card footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

                      <span className="text-xs font-medium text-gray-500">
                        Manage Listing
                      </span>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7EDEF] text-[#7A1F2B] transition-all group-hover:bg-[#7A1F2B] group-hover:text-white">
                        <ArrowUpRight size={16} />
                      </div>

                    </div>

                  </div>

                </Link>
              ))}

            </div>
          ) : (
            /* EMPTY STATE */
            <div className="mt-6 rounded-3xl border border-dashed border-[#7A1F2B]/20 bg-white px-6 py-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7EDEF]">
                <Layers3
                  size={28}
                  className="text-[#7A1F2B]"
                />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#3D0F15]">
                Your next listing starts here
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Add your first stay, event, or activity to
                start showcasing your business on Odini.
              </p>

              <Link
                href="/host/listings/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
              >
                <Plus size={17} />
                Create Your First Listing
              </Link>

            </div>
          )}

        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-12">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#3D0F15]">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Jump straight to what matters.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <Link
              href="/host/listings"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-[#7A1F2B]/20 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7EDEF] text-[#7A1F2B]">
                <Layers3 size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[#3D0F15]">
                  Manage Listings
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Edit, publish, or update your offerings.
                </p>
              </div>

              <ArrowUpRight
                size={19}
                className="shrink-0 text-gray-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#7A1F2B]"
              />
            </Link>

            <Link
              href="/host/bookings"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-[#7A1F2B]/20 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4DD] text-[#9A6B15]">
                <CalendarCheck size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[#3D0F15]">
                  Manage Bookings
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Review guest requests and confirmations.
                </p>
              </div>

              <ArrowUpRight
                size={19}
                className="shrink-0 text-gray-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#7A1F2B]"
              />
            </Link>

          </div>
        </section>

      </div>
    </main>
  )
}
