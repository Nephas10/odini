
"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"

import ListingPreviewCard from "@/components/landing/ListingPreviewCard"

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

// Placeholder ideas that rotate in the search bar.
// The first one is what visitors see on arrival.
const PLACEHOLDERS = [
  "Discover something new",
  "Stays in Lusaka",
  "Events near me",
  "Activities in Livingstone",
  "Weekend getaways in Siavonga",
  "Live music this weekend",
  "Safari lodges in South Luangwa",
  "Things to do in Ndola",
  "Lakeside stays in Kariba",
  "Boat cruises on the Zambezi",
  "Food festivals in Lusaka",
  "Guesthouses in Kitwe",
  "Adventure activities at Victoria Falls",
  "Family-friendly events",
  "Cabins in Kasama",
  "Nightlife in Lusaka",
]

const PLACEHOLDER_INTERVAL_MS = 3000

// Words in a quick search that point to a category.
const CATEGORY_KEYWORDS: Record<string, string> = {
  stay: "stay",
  stays: "stay",
  lodge: "stay",
  lodges: "stay",
  guesthouse: "stay",
  guesthouses: "stay",
  hotel: "stay",
  hotels: "stay",
  cabin: "stay",
  cabins: "stay",
  event: "event",
  events: "event",
  concert: "event",
  concerts: "event",
  festival: "event",
  festivals: "event",
  activity: "activity",
  activities: "activity",
  "things to do": "activity",
}

// Filler words that shouldn't have to match listing text.
const STOP_WORDS = new Set([
  "in",
  "at",
  "near",
  "me",
  "around",
  "the",
  "a",
  "an",
  "for",
  "to",
  "of",
  "and",
  "this",
  "weekend",
])

type ParsedQuery = {
  category: string | null
  location: string | null
  terms: string[]
}

// Reads a quick search like "stays in Lusaka" and picks out
// the category and location, leaving the rest as search terms.
function parseQuery(
  text: string,
  locations: string[]
): ParsedQuery {
  let rest = ` ${text.toLowerCase().trim()} `
  let category: string | null = null
  let location: string | null = null

  // Longest location names first so "Lusaka West" wins over "Lusaka".
  const byLength = [...locations].sort(
    (a, b) => b.length - a.length
  )

  for (const place of byLength) {
    const needle = ` ${place.toLowerCase()} `
    if (rest.includes(needle)) {
      location = place
      rest = rest.replace(needle, " ")
      break
    }
  }

  for (const [keyword, value] of Object.entries(
    CATEGORY_KEYWORDS
  )) {
    const needle = ` ${keyword} `
    if (rest.includes(needle)) {
      category = value
      rest = rest.replace(needle, " ")
      break
    }
  }

  const terms = rest
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.has(word))

  return { category, location, terms }
}

export default function PublicExploreClient({
  listings,
  hasError = false,
  isLoggedIn,
  hasMoreListings,
  initialCategory = "all",
}: Props) {
  // What's typed in the bar vs. what the results use.
  const [draft, setDraft] = useState("")
  const [terms, setTerms] = useState<string[]>([])
  const [category, setCategory] = useState(initialCategory)
  const [location, setLocation] = useState("all")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderVisible, setPlaceholderVisible] =
    useState(true)

  const searchAreaRef = useRef<HTMLDivElement>(null)

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

  // Rotate the placeholder while the bar is empty.
  useEffect(() => {
    if (draft) return

    let swapTimer: ReturnType<typeof setTimeout>

    const rotateTimer = setInterval(() => {
      setPlaceholderVisible(false)

      swapTimer = setTimeout(() => {
        setPlaceholderIndex(
          (index) => (index + 1) % PLACEHOLDERS.length
        )
        setPlaceholderVisible(true)
      }, 250)
    }, PLACEHOLDER_INTERVAL_MS)

    return () => {
      clearInterval(rotateTimer)
      clearTimeout(swapTimer)
    }
  }, [draft])

  // Close the filters dropdown on outside click or Escape.
  useEffect(() => {
    if (!filtersOpen) return

    function handleClick(event: MouseEvent) {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(
          event.target as Node
        )
      ) {
        setFiltersOpen(false)
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false)
    }

    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)

    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [filtersOpen])

  // Pre-fill the filters from what's typed in the bar.
  function applyDraftToFilters() {
    const parsed = parseQuery(draft, locations)

    if (parsed.category) setCategory(parsed.category)
    if (parsed.location) setLocation(parsed.location)

    return parsed
  }

  function toggleFilters() {
    if (!filtersOpen) applyDraftToFilters()
    setFiltersOpen((open) => !open)
  }

  // Quick search: read the bar, set filters, run it.
  function handleSearch(event: FormEvent) {
    event.preventDefault()

    const parsed = applyDraftToFilters()
    setTerms(parsed.terms)
    setFiltersOpen(false)
  }

  function clearFilters() {
    setDraft("")
    setTerms([])
    setCategory("all")
    setLocation("all")
  }

  // Search and filter the currently visible listings.
  const filteredListings = useMemo(() => {
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
        listing.listing_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch = terms.every((term) =>
        searchableText.includes(term)
      )

      return (
        matchesCategory &&
        matchesLocation &&
        matchesSearch
      )
    })
  }, [listings, terms, category, location])

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (location !== "all" ? 1 : 0)

  const hasFilters =
    terms.length > 0 || activeFilterCount > 0

  return (
    <main className="min-h-screen bg-[#121012] text-white">

      {/* Public navbar */}
      <header className="sticky top-0 z-50 bg-black">

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

      {/* Hero: just the label and the search */}
      <section className="relative z-40 border-b border-white/10 bg-gradient-to-b from-black via-[#2B1720] to-[#121012]">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">

          <span className="inline-flex items-center gap-2 rounded-full border border-[#e8365d]/20 bg-[#e8365d]/10 px-4 py-2 text-xs font-semibold text-[#FF8CA5]">
            <Compass size={15} />
            Discover Zambia with Odini
          </span>

          {/* Search */}
          <div
            ref={searchAreaRef}
            className="relative mt-6 max-w-3xl"
          >
            <form
              role="search"
              onSubmit={handleSearch}
              className="flex items-center gap-3"
            >
              {/* The bar: input | filters */}
              <div className="flex h-13 min-w-0 flex-1 items-center rounded-full border border-white/15 bg-[#242024] transition focus-within:border-white/40 focus-within:shadow-[0_0_0_0.2px_rgb(255_255_255/0.4)]">
                <div className="relative min-w-0 flex-1">
                  <input
                    type="search"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    aria-label="Search listings"
                    className="w-full bg-transparent py-3.5 pl-5 pr-3 text-sm text-white outline-none"
                  />

                  {/* Rotating placeholder */}
                  {!draft && (
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-y-0 left-5 right-3 flex items-center truncate text-sm text-white/35 transition-opacity duration-200 ${
                        placeholderVisible
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      {PLACEHOLDERS[placeholderIndex]}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <span
                  aria-hidden="true"
                  className="h-6 w-px shrink-0 bg-white/15"
                />

                <button
                  type="button"
                  onClick={toggleFilters}
                  aria-expanded={filtersOpen}
                  aria-controls="explore-filters"
                  aria-label="Filters"
                  className={`relative mx-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10 ${
                    filtersOpen || activeFilterCount > 0
                      ? "text-[#FF8CA5]"
                      : "text-white/55"
                  }`}
                >
                  <SlidersHorizontal size={19} />

                  {activeFilterCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e8365d] px-1 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Quick search */}
              <button
                type="submit"
                aria-label="Search"
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black text-[#e8365d] outline-none transition hover:border-[#e8365d] focus-visible:ring-2 focus-visible:ring-[#e8365d]"
              >
                <Search size={20} aria-hidden="true" />
              </button>
            </form>

            {/* Filters dropdown */}
            {filtersOpen && (
              <div
                id="explore-filters"
                className="absolute left-0 right-0 top-full mt-3 rounded-2xl border border-white/10 bg-[#1C1A1D] p-5 shadow-2xl shadow-black/50"
              >
                {/* Category */}
                <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
                  Category
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORIES.map((item) => {
                    const selected = category === item.value

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setCategory(item.value)}
                        aria-pressed={selected}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          selected
                            ? "bg-[#e8365d] text-white"
                            : "border border-white/10 bg-[#242024] text-white/65 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>

                {/* Location */}
                <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/45">
                  Location
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {["all", ...locations].map((place) => {
                    const selected = location === place

                    return (
                      <button
                        key={place}
                        type="button"
                        onClick={() => setLocation(place)}
                        aria-pressed={selected}
                        className={`rounded-full border bg-[#242024] px-4 py-2 text-sm font-semibold transition ${
                          selected
                            ? "border-white/40 text-white shadow-[0_0_0_0.2px_rgb(255_255_255/0.4)]"
                            : "border-white/10 text-white/65 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {place === "all"
                          ? "All locations"
                          : place}
                      </button>
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-white/55 transition hover:text-white"
                  >
                    Clear all
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-full bg-[#e8365d] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#d02d50]"
                  >
                    Show {filteredListings.length}{" "}
                    {filteredListings.length === 1
                      ? "result"
                      : "results"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main explore content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">

        {/* Results header */}
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
                There&apos;s more waiting for you.
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/60">
                You&apos;ve reached Odini&apos;s public preview.
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
