
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

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
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "stay", label: "Stays" },
  { value: "event", label: "Events" },
  { value: "activity", label: "Activities" },
  { value: "service", label: "Services" },
]

function formatPrice(price: number | null) {
  if (price === null) {
    return "Price on request"
  }

  return `K${price.toLocaleString("en-ZM")}`
}

export default function PublicExploreClient({
  listings,
  hasError = false,
  isLoggedIn,
  hasMoreListings,
}: Props) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [location, setLocation] = useState("all")

  // Build location options from actual listings.
  const locations = useMemo(() => {
    return Array.from(
      new Set(
        listings
          .map((listing) => listing.location?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort()
  }, [listings])

  // Client-side filters
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

  function clearFilters() {
    setSearch("")
    setCategory("all")
    setLocation("all")
  }

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    location !== "all"

  return (
    <main className="min-h-screen bg-[#101010] text-white">

      {/* Public navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#101010]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight"
            >
              odini
            </Link>

            <Link
              href="/explore"
              aria-current="page"
              className="hidden text-sm font-semibold text-[#e8365d] sm:block"
            >
              Explore
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/auth/signup"
              className="rounded-full bg-[#e8365d] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#d02d50] sm:text-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-white/10 bg-gradient-to-b from-[#211117] to-[#101010]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">

          <span className="inline-flex items-center gap-2 rounded-full border border-[#e8365d]/30 bg-[#e8365d]/10 px-4 py-2 text-xs font-semibold text-[#ff6885]">
            <Compass size={15} />
            Discover Zambia with Odini
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Find something
            <span className="text-[#e8365d]">
              {" "}worth experiencing.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            Discover stays, exciting events and memorable
            activities. Explore freely, compare options
            and only sign up when you're ready to book.
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
              className="w-full rounded-2xl border border-white/15 bg-[#242424] py-4 pl-12 pr-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e8365d]"
            />
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3">
          {CATEGORIES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              aria-pressed={category === item.value}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                category === item.value
                  ? "bg-[#e8365d] text-white"
                  : "border border-white/10 bg-[#202020] text-white/65 hover:border-white/25 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Results and location */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              Explore experiences
            </h2>

            <p className="mt-1 text-sm text-white/45">
              {filteredListings.length}{" "}
              {filteredListings.length === 1
                ? "experience"
                : "experiences"}{" "}
              found
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={17}
              className="text-white/45"
            />

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Filter by location"
              className="max-w-48 rounded-xl border border-white/15 bg-[#222222] px-3 py-2.5 text-sm text-white outline-none focus:border-[#e8365d]"
            >
              <option value="all">All locations</option>

              {locations.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {hasError ? (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-500/20 bg-[#1C1C1C] p-10 text-center"
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
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-[#1B1B1B] px-6 py-14 text-center">
            <CalendarDays
              size={36}
              className="mx-auto text-[#e8365d]"
            />

            <h3 className="mt-4 text-lg font-bold">
              {hasFilters
                ? "No matching experiences"
                : "Experiences are coming soon"}
            </h3>

            <p className="mt-2 text-sm text-white/50">
              {hasFilters
                ? "Try a different search, category or location."
                : "Check back soon for new stays, events and activities."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>

        ) : (

          /* Listing cards */
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {filteredListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D] transition duration-300 hover:-translate-y-1 hover:border-[#e8365d]/50"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-[#292929]">

                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/30">
                      Photo coming soon
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-[#101010]/85 px-3 py-1.5 text-xs font-semibold capitalize text-white backdrop-blur">
                    {listing.listing_type}
                  </span>
                </div>

                {/* Listing details */}
                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-bold text-white transition group-hover:text-[#ff6885]">
                    {listing.title}
                  </h3>

                  {listing.location && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-white/50">
                      <MapPin
                        size={14}
                        className="shrink-0 text-[#e8365d]"
                      />
                      <span className="truncate">
                        {listing.location}
                      </span>
                    </p>
                  )}

                  <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-white/45">
                    {listing.description ||
                      "Discover more about this experience on Odini."}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">

                    <div>
                      <p className="text-xs text-white/40">
                        Starting from
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {formatPrice(listing.price)}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff6885]">
                      View details
                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}

          </div>
        )}
      </section>
      
        {/* Guest preview limit */}
        {!isLoggedIn && hasMoreListings && !hasError && (
        <div className="mt-12 rounded-2xl border border-[#e8365d]/25 bg-gradient-to-br from-[#2A151B] to-[#1A1A1A] px-6 py-10 text-center sm:px-10">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8365d]/15">
            <Search size={23} className="text-[#e8365d]" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white">
            There's more waiting for you!
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/60">
            You're exploring a preview of Odini.
            Create a free account to discover more stays,
            events and activities across Zambia.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">

            <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#d02d50]"
            >
                Sign up to explore more
                <ArrowRight size={17} />
            </Link>

            <Link
                href="/auth/login"
                className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
                Already have an account?
            </Link>

            </div>
        </div>
        )}

      {/* Join as host CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-7 text-center sm:p-10">
          <h2 className="text-2xl font-bold">
            Have an experience to share?
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55">
            Whether you offer accommodation, organize
            events or provide activities, Odini helps
            people discover what you offer.
          </p>

          <Link
            href="/auth/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d02d50]"
          >
            Join Odini
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}
