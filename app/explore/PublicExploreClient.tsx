
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Compass,
  LockKeyhole,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"

import ListingPreviewCard from "@/components/landing/ListingPreviewCard"
import { useRouter } from "next/navigation"

type PublicListing = {
  id: string
  title: string
  description: string | null
  listing_type: string
  location: string | null
  price: number | null
  image_url: string | null
}

type Props = {
  listings: PublicListing[]
  hasError?: boolean
  isLoggedIn: boolean
  hasMoreListings: boolean
  initialCategory?: string
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "stay", label: "Stays" },
  { value: "event", label: "Events" },
  { value: "activity", label: "Activities" },
  
]

export default function PublicExploreClient({
  listings,
  hasError = false,
  isLoggedIn,
  hasMoreListings,
  initialCategory = "all",
}: Props) {
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("all")
  const router = useRouter()

  function clearFilters() {
    setSearch("")
    setLocation("all")

    if (category !== "all") {
      router.push("/explore", { scroll: false })
    }
  }
  // The URL controls the selected category.
  const category = initialCategory

  // Build available locations from the
  // listings this visitor is allowed to browse.
  const locations = useMemo(() => {
    return Array.from(
      new Set(
        listings
          .map((listing) => listing.location?.trim())
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      )
    ).sort()
  }, [listings])

  // Search and filter the currently visible listings.
  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return listings.filter((listing) => {
      const matchesCategory =
        category === "all" ||
        listing.listing_type === category

      const matchesLocation =
        location === "all" ||
        listing.location?.trim() === location

      const searchableText = [
        listing.title,
        listing.description,
        listing.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        !query || searchableText.includes(query)

      return (
        matchesCategory &&
        matchesLocation &&
        matchesSearch
      )
    })
  }, [listings, search, category, location])

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    location !== "all"

  const categoryHref = (value: string) =>
    value === "all"
      ? "/explore"
      : `/explore?category=${value}`

  return (
    <main className="min-h-screen bg-[#121012] text-white">

      {/* Public navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#121012]/95 backdrop-blur">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">

          <div className="flex items-center gap-6">

            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-white"
            >
              odini
              <span className="text-[#e8365d]">.</span>
            </Link>

            <Link
              href="/explore"
              aria-current="page"
              className="hidden text-sm font-semibold text-[#FF8CA5] sm:block"
            >
              Explore
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/user"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                My account
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-white/65 transition hover:text-white"
                >
                  Log in
                </Link>

                <Link
                  href="/auth/signup"
                  className="rounded-full bg-[#e8365d] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#d02d50] sm:text-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-white/10 bg-gradient-to-b from-[#2B1720] to-[#121012]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">

          <span className="inline-flex items-center gap-2 rounded-full border border-[#e8365d]/20 bg-[#e8365d]/10 px-4 py-2 text-xs font-semibold text-[#FF8CA5]">
            <Compass size={15} />
            Discover Zambia with Odini
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find something{" "}
            <span className="text-[#e8365d]">
              worth experiencing.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            Discover stays, exciting events and memorable
            activities across Zambia. Explore experiences
            and see their details before deciding to book.
          </p>

          {/* Search */}
          <div className="relative mt-8 max-w-2xl">

            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stays, events, activities..."
              aria-label="Search listings"
              className="w-full rounded-2xl border border-white/15 bg-[#242024] py-4 pl-12 pr-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e8365d]"
            />
          </div>

          {/* Guest preview message */}
          {!isLoggedIn && (
            <div className="mt-5 inline-flex items-center gap-2 text-xs text-white/45">
              <LockKeyhole
                size={14}
                className="text-[#FF8CA5]"
              />

              <span>
                Preview up to 7 experiences without
                logging in.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Main explore content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">

        {/* Category navigation */}
        <nav
          aria-label="Listing categories"
          className="flex gap-2 overflow-x-auto pb-3"
        >
          {CATEGORIES.map((item) => {
            const selected = category === item.value

            return (
              <Link
                key={item.value}
                href={categoryHref(item.value)}
                aria-current={selected ? "page" : undefined}
                scroll={false}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  selected
                    ? "bg-[#e8365d] text-white"
                    : "border border-white/10 bg-[#202020] text-white/65 hover:border-white/25 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Results header */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              Explore experiences
            </h2>

            <p
              aria-live="polite"
              className="mt-2 text-sm text-white/45"
            >
              {filteredListings.length}{" "}
              {filteredListings.length === 1
                ? "experience"
                : "experiences"}{" "}
              found
              {!isLoggedIn && " in your preview"}
            </p>
          </div>

          {/* Location filter */}
          <div className="flex items-center gap-2">

            <SlidersHorizontal
              size={17}
              className="text-white/45"
            />

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Filter by location"
              className="max-w-48 rounded-xl border border-white/15 bg-[#242024] px-3 py-2.5 text-sm text-white outline-none focus:border-[#e8365d]"
            >
              <option value="all">
                All locations
              </option>

              {locations.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Error state */}
        {hasError ? (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-500/20 bg-[#1C1A1D] p-10 text-center"
          >
            <h3 className="font-semibold">
              Unable to load experiences
            </h3>

            <p className="mt-2 text-sm text-white/50">
              Please refresh the page and try again.
            </p>
          </div>
        ) : filteredListings.length === 0 ? (
          /* Empty state */
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-[#1C1A1D] px-6 py-14 text-center">

            <CalendarDays
              size={36}
              className="mx-auto text-[#e8365d]"
            />

            <h3 className="mt-5 text-xl font-bold">
              {hasFilters
                ? "No matching experiences"
                : "Experiences are coming soon"}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/50">
              {hasFilters
                ? isLoggedIn
                  ? "Try another search, category or location."
                  : "No matches in the seven-listing preview. More experiences may be available when you log in."
                : "Check back soon for new stays, events and activities."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d02d50]"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          /* Reuse the redesigned homepage cards */
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingPreviewCard
                key={listing.id}
                listing={listing}
              />
            ))}
          </div>
        )}

        {/* Invitation to unlock more listings */}
        {!isLoggedIn &&
          hasMoreListings &&
          !hasError && (
            <div className="mt-14 overflow-hidden rounded-3xl border border-[#e8365d]/20 bg-gradient-to-br from-[#351923] via-[#24181E] to-[#1C1A1D] px-6 py-12 text-center sm:px-10">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8365d]/15">
                <Sparkles
                  size={26}
                  className="text-[#FF8CA5]"
                />
              </div>

              <h2 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">
                There's more waiting for you.
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/60">
                You've reached Odini's public preview.
                Create a free account or log in to
                discover more stays, events and
                activities across Zambia.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#d02d50]"
                >
                  Sign up to explore more

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/auth/login"
                  className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Already have an account?
                </Link>

              </div>

              <p className="mt-5 text-xs text-white/40">
                No account needed to view the
                seven preview experiences.
              </p>

            </div>
          )}

        {/* Host CTA */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-[#1C1A1D] px-6 py-10 text-center sm:px-10">

          <h2 className="text-2xl font-bold">
            Have an experience to share?
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/55">
            Whether you offer accommodation,
            organize events or provide activities,
            Odini helps people discover what
            you have to offer.
          </p>

          <Link
            href={isLoggedIn ? "/host" : "/auth/signup"}
            className="group mt-7 inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#d02d50]"
          >
            {isLoggedIn
              ? "Go to hosting"
              : "Join Odini"}

            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

        </div>

      </section>
    </main>
  )
}
