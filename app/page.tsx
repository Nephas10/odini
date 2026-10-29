
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { createClient } from "@/lib/supabase/server"

import LandingNavbar from "@/components/landing/LandingNavbar"
import LandingHero from "@/components/landing/LandingHero"
import ListingPreviewCard from "@/components/landing/ListingPreviewCard"
import LandingFooter from "@/components/landing/LandingFooter"

export default async function Home() {
  const supabase = await createClient()

  // Check authentication only to personalize the navigation.
  // Visitors do not need to log in to explore listings.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoggedIn = !!user

  // Load the latest published listings
  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      "id, title, description, listing_type, price, location, image_url"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6)

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <LandingNavbar isLoggedIn={isLoggedIn} />

      {/* Hero */}
      <LandingHero isLoggedIn={isLoggedIn} />

      {/* Featured Listings */}
      <section
        id="explore"
        className="scroll-mt-8 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">

          {/* Section Header */}
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#7A1F2B]">
                Explore Odini
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Experiences worth discovering
              </h2>

              <p className="mt-3 max-w-2xl text-gray-500">
                Find memorable stays, exciting events and
                activities offered by local hosts across Zambia.
                Explore freely, no account required.
              </p>
            </div>

            {/* Public Explore link */}
            <Link
              href="/explore"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#7A1F2B] transition hover:gap-3 hover:text-[#5E1721]"
            >
              Explore all
              <ArrowRight size={17} />
            </Link>

          </div>

          {/* Listings Grid */}
          {error ? (
            <div className="mt-8 rounded-2xl border border-red-100 bg-white p-10 text-center">

              <h3 className="font-semibold text-gray-900">
                Unable to load experiences
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Please try again later.
              </p>

            </div>
          ) : listings && listings.length > 0 ? (

            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingPreviewCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>

          ) : (

            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-12 text-center">

              <h3 className="text-lg font-semibold text-gray-900">
                Experiences are coming soon
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                We're preparing exciting experiences for
                you to discover.
              </p>

            </div>

          )}

          {/* View all experiences */}
          {!error && listings && listings.length > 0 && (
            <div className="mt-10 text-center">

              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-[#7A1F2B] px-7 py-3 text-sm font-bold text-[#7A1F2B] transition hover:bg-[#7A1F2B] hover:text-white"
              >
                View all experiences
                <ArrowRight size={17} />
              </Link>

            </div>
          )}

        </div>
      </section>

      {/* Call To Action */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="overflow-hidden rounded-3xl bg-[#7A1F2B] px-6 py-14 text-center sm:px-10 sm:py-20">

            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
              Your next experience awaits
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to discover something new?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              Explore exciting experiences, discover new
              places and connect with hosts across Zambia.
              Browse before you book.
            </p>

            {/* Primary CTA: public discovery */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#7A1F2B] transition hover:bg-gray-100"
              >
                Explore experiences
                <ArrowRight size={17} />
              </Link>

              {/* Secondary CTA: registration */}
              {!isLoggedIn && (
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center rounded-full border border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Create an account
                </Link>
              )}

            </div>

            <p className="mt-5 text-xs text-white/60">
              No account needed to browse. Sign in when
              you're ready to book.
            </p>

          </div>

        </div>
      </section>

      {/* Footer */}
      <LandingFooter />

    </main>
  )
}
