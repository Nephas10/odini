
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ShieldCheck,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

type Props = {
  params: Promise<{ id: string }>
}

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

  // Public information only.
  // Do not retrieve host phone numbers or private booking data.
  const { data: listing, error } = await supabase
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
    console.error("Public listing error:", error.message)
    notFound()
  }

  if (!listing) {
    notFound()
  }

  // Authentication is checked only to choose
  // the booking destination, not to restrict viewing.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const bookingPath = `/user/listings/${listing.id}`

  const bookingHref = user
    ? bookingPath
    : `/auth/login?next=${encodeURIComponent(bookingPath)}`

  const category =
    CATEGORY_LABELS[listing.listing_type] ??
    listing.listing_type

  return (
    <main className="min-h-screen bg-[#101010] text-white">

      {/* Public navigation */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">

          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-white"
          >
            odini
          </Link>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-white/70 hover:text-white"
                >
                  Log in
                </Link>

                <Link
                  href="/auth/signup"
                  className="rounded-full bg-[#e8365d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d32e52]"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <Link
                href="/user"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10"
              >
                My account
              </Link>
            )}
          </div>

        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to discovery
        </Link>

        {/* Listing header */}
        <div className="mt-8">
          <span className="rounded-full bg-[#e8365d]/15 px-3 py-1.5 text-xs font-semibold capitalize text-[#e8365d]">
            {category}
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {listing.title}
          </h1>

          {listing.location && (
            <p className="mt-3 flex items-center gap-2 text-sm text-white/60">
              <MapPin size={17} className="text-[#e8365d]" />
              {listing.location}
            </p>
          )}
        </div>

        {/* Listing image */}
        <div className="mt-7 overflow-hidden rounded-2xl bg-[#242424]">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="h-64 w-full object-cover sm:h-96"
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-white/40 sm:h-96">
              Listing photo coming soon
            </div>
          )}
        </div>

        {/* Details and booking */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* Description */}
          <section>
            <h2 className="text-xl font-bold">
              About this {category.toLowerCase()}
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-white/65 sm:text-base">
              {listing.description ||
                "More information about this experience will be available soon."}
            </p>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/10 bg-[#1B1B1B] p-4">
              <CalendarDays
                size={20}
                className="shrink-0 text-[#e8365d]"
              />

              <div>
                <h3 className="font-semibold">
                  Ready to experience it?
                </h3>

                <p className="mt-1 text-sm leading-6 text-white/55">
                  Continue to booking to view the available
                  booking options for this listing.
                </p>
              </div>
            </div>
          </section>

          {/* Booking card */}
          <aside>
            <div className="rounded-2xl border border-white/10 bg-[#1B1B1B] p-6 lg:sticky lg:top-24">

              <p className="text-sm text-white/50">
                Starting price
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {listing.price !== null
                    ? `K${listing.price.toLocaleString("en-ZM")}`
                    : "On request"}
                </span>
              </div>

              {listing.price !== null && (
                <p className="mt-2 text-xs text-white/40">
                  Final total depends on your booking options.
                </p>
              )}

              <Link
                href={bookingHref}
                className="mt-6 block rounded-xl bg-[#e8365d] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#d32e52]"
              >
                {user ? "Continue to booking" : "Book this experience"}
              </Link>

              {!user && (
                <p className="mt-3 text-center text-xs leading-5 text-white/45">
                  Explore freely. An account is only required
                  when you're ready to book.
                </p>
              )}

              <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-white/50">
                <ShieldCheck
                  size={17}
                  className="text-[#e8365d]"
                />

                Booking requests are managed through Odini.
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
