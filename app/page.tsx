
import Link from "next/link"
import {
  ArrowRight,
  Compass,
  Sparkles,
  ShieldCheck,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

import LandingNavbar from "@/components/landing/LandingNavbar"
import LandingHero from "@/components/landing/LandingHero"

import ListingPreviewCard from "@/components/landing/ListingPreviewCard"
import LandingFooter from "@/components/landing/LandingFooter"

export default async function Home() {
  const supabase = await createClient()

  // Personalize navigation without restricting public access
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoggedIn = !!user

  // Fetch the latest six published listings
  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      "id, title, description, listing_type, price, location, image_url"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6)

  return (
    <main className="min-h-screen bg-[#F8F5F3]">

      {/* Navbar */}
      <LandingNavbar isLoggedIn={isLoggedIn} />

      {/* Hero */}
      <LandingHero isLoggedIn={isLoggedIn} />

      {/* Featured experiences */}
      <section
        id="explore"
        className="relative scroll-mt-28 overflow-hidden border-t border-[#7A1F2B]/5 bg-[#EEE9E7] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >

        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#e8365d]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">

          {/* Section heading */}
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div className="max-w-2xl">

              {/* Eyebrow */}
              <span className="inline-flex items-center gap-2 rounded-full border border-[#7A1F2B]/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#7A1F2B]">
                <Sparkles size={14} />
                Featured on Odini
              </span>

              {/* Title */}
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-[#20191C] sm:text-4xl lg:text-5xl">
                Experiences worth{" "}
                <span className="text-[#7A1F2B]">
                  discovering.
                </span>
              </h2>

              {/* Description */}
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#71666A] sm:text-base">
                Discover memorable stays, exciting events
                and activities offered by local hosts
                across Zambia.
              </p>

            </div>

            {/* Explore all link */}
            <Link
              href="/explore"
              className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#7A1F2B]/20 bg-white px-5 py-3 text-sm font-bold text-[#7A1F2B] transition hover:border-[#7A1F2B] hover:bg-[#7A1F2B] hover:text-white"
            >
              Explore all

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>

          {/* Featured listings grid */}
          {error ? (

            /* Error state */
            <div
              role="alert"
              className="mt-10 rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm"
            >
              <h3 className="font-bold text-[#20191C]">
                Unable to load experiences
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Please refresh the page and try again.
              </p>
            </div>

          ) : listings && listings.length > 0 ? (

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingPreviewCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>

          ) : (

            /* Empty state */
            <div className="mt-10 rounded-3xl border border-[#7A1F2B]/10 bg-white/80 px-6 py-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7A1F2B]/10">
                <Compass
                  size={28}
                  className="text-[#7A1F2B]"
                />
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#20191C]">
                Something exciting is coming.
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
                We're preparing new stays, events and
                activities for you to discover on Odini.
              </p>

            </div>

          )}

          {/* View all listings */}
          {!error && listings && listings.length > 0 && (

            <div className="mt-12 flex flex-col items-center gap-4 text-center">

              <Link
                href="/explore"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#7A1F2B] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7A1F2B]/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#e8365d]"
              >
                View all experiences

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <p className="text-xs text-[#71666A]">
                Explore stays, events and activities
                without creating an account.
              </p>

            </div>

          )}

        </div>
      </section>

      {/* Final discovery CTA */}
      <section className="relative overflow-hidden bg-[#121012] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

        {/* Background glow */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#7A1F2B]/20 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#7A1F2B] via-[#5A1927] to-[#28141C] px-6 py-14 text-center shadow-2xl shadow-black/20 sm:px-10 sm:py-20">

            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/10 bg-white/5" />

            <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full border border-white/10 bg-white/5" />

            <div className="relative mx-auto max-w-3xl">

              {/* Section tag */}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#FFD5DE]">
                <Sparkles size={15} />
                Your next experience awaits
              </span>

              {/* CTA heading */}
              <h2 className="mt-7 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Your next great experience{" "}
                <span className="text-[#FF9AAF]">
                  starts here.
                </span>
              </h2>

              {/* Description */}
              <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
                Explore exciting events, discover new
                places and connect with experiences
                across Zambia. Find what interests you
                and book when you're ready.
              </p>

              {/* CTA buttons */}
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">

                <Link
                  href="/explore"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#7A1F2B] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE6EC]"
                >
                  Explore experiences

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                {!isLoggedIn ? (
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center rounded-full border border-white/35 px-8 py-3.5 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/10"
                  >
                    Create an account
                  </Link>
                ) : (
                  <Link
                    href="/user"
                    className="inline-flex items-center justify-center rounded-full border border-white/35 px-8 py-3.5 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/10"
                  >
                    My dashboard
                  </Link>
                )}

              </div>

              {/* Trust message */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/65">
                <ShieldCheck
                  size={17}
                  className="text-[#FF9AAF]"
                />

                <span>
                  Browse freely. Sign in when you're ready to book.
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <LandingFooter />

    </main>
  )
}
