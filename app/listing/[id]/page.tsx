
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  ShieldCheck,
  LockKeyhole,
  Ticket,
  BedDouble,
  Compass,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

type Props = {
  params: Promise<{ id: string }>
}

const GUEST_LISTING_LIMIT = 7

const CATEGORY_LABELS: Record<string, string> = {
  stay: "Stay",
  event: "Event",
  activity: "Activity",
  service: "Service",
}

export default async function PublicListingPage({
  params,
}: Props) {
  const { id } = await params

  const supabase = await createClient()

  // Check authentication.
  // Guests can still browse, but only the first
  // seven published listings are publicly viewable.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check which listings are visible to guests.
  if (!user) {
    const {
      data: guestListings,
      error: guestError,
    } = await supabase
      .from("listings")
      .select("id")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(GUEST_LISTING_LIMIT)

    if (guestError) {
      console.error(
        "Guest listing check failed:",
        guestError.message
      )
      notFound()
    }

    const canViewListing = guestListings?.some(
      (item) => item.id === id
    )

    if (!canViewListing) {
      notFound()
    }
  }

  // Fetch public listing information only.
  // Never expose host phone numbers or private
  // booking information here.
  const {
    data: listing,
    error,
  } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      listing_type,
      price,
      location,
      image_url,
      is_active
    `)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle()

  if (error) {
    console.error(
      "Public listing error:",
      error.message
    )
    notFound()
  }

  if (!listing) {
    notFound()
  }

  // Existing authenticated booking route
  const bookingPath = `/user/listings/${listing.id}`

  // Preserve intended destination through login/signup
  const encodedNext = encodeURIComponent(bookingPath)

  const loginHref =
    `/auth/login?next=${encodedNext}`

  const signupHref =
    `/auth/signup?next=${encodedNext}`

  const bookingHref = user
    ? bookingPath
    : loginHref

  const category =
    CATEGORY_LABELS[listing.listing_type] ??
    listing.listing_type

  const isEvent = listing.listing_type === "event"
  const isStay = listing.listing_type === "stay"

  const CategoryIcon = isEvent
    ? Ticket
    : isStay
      ? BedDouble
      : Compass

  const bookingLabel = isEvent
    ? "Reserve tickets"
    : isStay
      ? "Book this stay"
      : "Book this experience"

  const priceText =
    listing.price !== null
      ? `K${listing.price.toLocaleString("en-ZM")}`
      : "On request"

  return (
    <main className="min-h-screen bg-[#121012] text-white">

      {/* Public navigation */}
      <header className="border-b border-white/10 bg-[#121012]">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">

          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-white"
          >
            odini
            <span className="text-[#e8365d]">.</span>
          </Link>

          <div className="flex items-center gap-3">

            {!user ? (
              <>
                <Link
                  href={loginHref}
                  className="text-sm font-semibold text-white/70 transition hover:text-white"
                >
                  Log in
                </Link>

                <Link
                  href={signupHref}
                  className="rounded-full bg-[#e8365d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d32e52]"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <Link
                href="/user"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                My account
              </Link>
            )}

          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 pb-20 sm:px-6">

        {/* Back to discovery */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-[#FF8CA5]"
        >
          <ArrowLeft size={16} />
          Back to Explore
        </Link>

        {/* Listing header */}
        <div className="mt-8">

          <span className="inline-flex items-center gap-2 rounded-full border border-[#e8365d]/20 bg-[#e8365d]/10 px-4 py-2 text-xs font-semibold text-[#FF8CA5]">

            <CategoryIcon size={15} />

            {category}
          </span>

          <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {listing.title}
          </h1>

          {listing.location && (
            <p className="mt-4 flex items-center gap-2 text-sm text-white/60">
              <MapPin
                size={17}
                className="text-[#e8365d]"
              />
              {listing.location}
            </p>
          )}

        </div>

        {/* Listing image */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#242024]">

          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="h-72 w-full object-cover sm:h-[420px]"
            />
          ) : (
            <div className="flex h-72 flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#392029] to-[#1C1A1D] sm:h-[420px]">

              <Compass
                size={42}
                className="text-[#FF8CA5]/60"
              />

              <span className="text-sm text-white/40">
                Listing photo coming soon
              </span>
            </div>
          )}

        </div>

        {/* Information and booking */}
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_350px]">

          {/* Listing description */}
          <section>

            <h2 className="text-2xl font-bold">
              About this {category.toLowerCase()}
            </h2>

            <p className="mt-5 whitespace-pre-line text-sm leading-8 text-white/65 sm:text-base">
              {listing.description ||
                "More information about this experience will be available soon."}
            </p>

            {/* Booking information */}
            <div className="mt-10 flex items-start gap-4 rounded-2xl border border-white/10 bg-[#1C1A1D] p-5">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8365d]/10">
                <CalendarDays
                  size={22}
                  className="text-[#FF8CA5]"
                />
              </div>

              <div>
                <h3 className="font-bold">
                  Ready to experience it?
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Continue to booking to select your
                  preferred options and submit your request.
                </p>
              </div>

            </div>

            {/* Guest information */}
            {!user && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e8365d]/15 bg-[#e8365d]/5 p-5">

                <LockKeyhole
                  size={20}
                  className="mt-0.5 shrink-0 text-[#FF8CA5]"
                />

                <div>
                  <h3 className="text-sm font-bold text-white">
                    Explore without an account
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/55">
                    You're welcome to browse Odini's public
                    preview listings. Log in or create an
                    account when you're ready to book
                    or explore the full collection.
                  </p>
                </div>

              </div>
            )}

          </section>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-24">

            <div className="rounded-3xl border border-white/10 bg-[#1C1A1D] p-6 shadow-xl shadow-black/10">

              <p className="text-sm text-white/50">
                Listed price
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight sm:text-4xl">
                  {priceText}
                </span>
              </div>

              {listing.price !== null && (
                <p className="mt-3 text-xs leading-5 text-white/40">
                  Final total depends on your booking
                  options and availability.
                </p>
              )}

              <div className="mt-6 h-px bg-white/10" />

              {/* Booking button */}
              <Link
                href={bookingHref}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8365d] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#d32e52]"
              >
                {bookingLabel}

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              {!user && (
                <p className="mt-4 text-center text-xs leading-5 text-white/45">
                  Login or signup is required to
                  continue with your booking.
                </p>
              )}

              <div className="mt-6 flex items-start gap-3 border-t border-white/10 pt-5">

                <ShieldCheck
                  size={19}
                  className="shrink-0 text-[#FF8CA5]"
                />

                <p className="text-xs leading-5 text-white/50">
                  Booking requests are managed
                  through Odini.
                </p>

              </div>

            </div>
          </aside>

        </div>

      </div>
    </main>
  )
}
