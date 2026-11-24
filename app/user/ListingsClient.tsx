
"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { MapPin, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

import { filterListings } from "@/lib/explore/filterListings"
import {
  getDestinationOptions,
  SUPPORTED_DESTINATIONS,
} from "@/lib/explore/locations"
import type { EventSchedule } from "@/lib/explore/eventDates"
import {
  matchesTerms,
  parseQuery,
  PLACEHOLDER_INTERVAL_MS,
  SEARCH_PLACEHOLDERS,
} from "@/lib/explore/quickSearch"
import SaveListingButton from "@/components/saved/SaveListingButton"

type Listing = {
  id: string
  listing_type: string
  title: string
  description: string | null
  price: number | null
  location: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  eventSchedule?: EventSchedule | null
}

type Props = {
  listings: Listing[]
  savedIds: string[]
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "stay", label: "Stays" },
  { value: "event", label: "Events" },
  { value: "activity", label: "Activities" },
]

const PRICE_UNIT: Record<string, string> = {
  stay: "/ night",
  event: "/ ticket",
  activity: "/ person",
}

const CATEGORY_BADGE_CLASS: Record<string, string> = {
  stay: "border-blue-400/40 text-blue-300",
  event: "border-[#e8365d]/40 text-rose-300",
  activity: "border-emerald-400/40 text-emerald-300",
}

// The 0.2px shadow makes the 1px border 20% thicker without shifting layout.
const inputClass =
  "w-full min-w-0 border border-white/40 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/60 focus:border-white/70 focus:bg-[#1a1a1a] focus:shadow-[0_0_0_0.2px_rgb(255_255_255/0.7)] [color-scheme:dark]"

const focusClass =
  "focus-visible:ring-2 focus-visible:ring-[#e8365d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"

const pillClass = (selected: boolean) =>
  selected
    ? "rounded-full border border-[#e8365d] bg-[#e8365d] px-4 py-2 text-sm font-medium text-black shadow-sm"
    : "rounded-full border border-white/40 bg-[#0f0f0f] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"

// Location pills brighten instead of turning pink
const locationPillClass = (selected: boolean) =>
  `rounded-full border bg-[#0f0f0f] px-4 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] ${
    selected
      ? "border-white/70 text-white shadow-[0_0_0_0.2px_rgb(255_255_255/0.7)]"
      : "border-white/40 text-white/80 hover:bg-white/10 hover:text-white"
  }`

export default function ListingsClient({
  listings,
  savedIds,
}: Props) {
  // What's typed in the bar vs. the terms the results use
  const [draft, setDraft] = useState("")
  const [terms, setTerms] = useState<string[]>([])

  // Filter states
  const [category, setCategory] = useState("all")
  const [location, setLocation] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [date, setDate] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Rotating placeholder
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderVisible, setPlaceholderVisible] =
    useState(true)

  const searchAreaRef = useRef<HTMLDivElement>(null)

  // Saved listing IDs retrieved by the server page
  const savedIdSet = useMemo(
    () => new Set(savedIds),
    [savedIds]
  )

  // Available locations
  const locations = useMemo(
    () => getDestinationOptions(listings),
    [listings]
  )

  // Rotate the placeholder while the bar is empty
  useEffect(() => {
    if (draft) return

    let swapTimer: ReturnType<typeof setTimeout>

    const rotateTimer = setInterval(() => {
      setPlaceholderVisible(false)

      swapTimer = setTimeout(() => {
        setPlaceholderIndex(
          (index) => (index + 1) % SEARCH_PLACEHOLDERS.length
        )
        setPlaceholderVisible(true)
      }, 250)
    }, PLACEHOLDER_INTERVAL_MS)

    return () => {
      clearInterval(rotateTimer)
      clearTimeout(swapTimer)
    }
  }, [draft])

  // Close the filters dropdown on outside click or Escape
  useEffect(() => {
    if (!filtersOpen) return

    function handleClick(event: MouseEvent) {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(event.target as Node)
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

  // Keep a location picked from the search bar visible
  // even if no listing currently uses it
  const locationOptions: string[] = ["all", ...locations]
  if (location !== "all" && !locationOptions.includes(location)) {
    locationOptions.push(location)
  }

  // Price validation
  const min = minPrice === "" ? null : Number(minPrice)
  const max = maxPrice === "" ? null : Number(maxPrice)

  const hasPriceFilter = min !== null || max !== null

  const priceRangeInvalid =
    min !== null && max !== null && min > max

  // Filter listings
  const filteredListings = filterListings(listings, {
    category,
    search: "",
    location,
    minPrice,
    maxPrice,
    date,
  }).filter((listing) => matchesTerms(listing, terms))

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (location !== "all" ? 1 : 0) +
    (hasPriceFilter ? 1 : 0) +
    (date !== "" ? 1 : 0)

  const hasAnyFilter = activeFilterCount > 0 || terms.length > 0

  // Pre-fill the filters from what's typed in the bar
  function applyDraftToFilters() {
    const parsed = parseQuery(draft, SUPPORTED_DESTINATIONS)

    if (parsed.category) setCategory(parsed.category)
    if (parsed.location) setLocation(parsed.location)

    return parsed
  }

  function toggleFilters() {
    if (!filtersOpen) applyDraftToFilters()
    setFiltersOpen((open) => !open)
  }

  // Quick search: read the bar, set filters, run it
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
    setMinPrice("")
    setMaxPrice("")
    setDate("")
  }

  return (
    <>
      {/* Search */}
      <div
        id="search"
        ref={searchAreaRef}
        className="relative z-30 max-w-3xl"
      >
        <form
          role="search"
          onSubmit={handleSearch}
          className="flex items-center gap-3"
        >
          {/* The bar: input | filters */}
          <div className="flex h-13 min-w-0 flex-1 items-center rounded-full border border-white/40 bg-white/5 transition focus-within:border-white/70 focus-within:bg-[#1a1a1a] focus-within:shadow-[0_0_0_0.2px_rgb(255_255_255/0.7)]">
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                aria-label="Search listings"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full bg-transparent py-3.5 pl-5 pr-3 text-sm text-white outline-none"
              />

              {/* Rotating placeholder */}
              {!draft && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-0 left-5 right-3 flex items-center truncate text-sm text-white/60 transition-opacity duration-200 ${
                    placeholderVisible ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {SEARCH_PLACEHOLDERS[placeholderIndex]}
                </span>
              )}
            </div>

            {/* Divider */}
            <span
              aria-hidden="true"
              className="h-6 w-px shrink-0 bg-white/30"
            />

            <button
              type="button"
              onClick={toggleFilters}
              aria-expanded={filtersOpen}
              aria-controls="explore-filters"
              aria-label="Filters"
              className={`relative mx-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10 ${focusClass} ${
                filtersOpen || activeFilterCount > 0
                  ? "text-[#e8365d]"
                  : "text-white/70"
              }`}
            >
              <SlidersHorizontal size={19} />

              {activeFilterCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e8365d] px-1 text-[10px] font-bold text-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick search */}
          <button
            type="submit"
            aria-label="Search"
            className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black text-[#e8365d] outline-none transition hover:border-[#e8365d] ${focusClass}`}
          >
            <Search size={20} aria-hidden="true" />
          </button>
        </form>

        {/* Filters dropdown */}
        {filtersOpen && (
          <div
            id="explore-filters"
            className="absolute left-0 right-0 top-full mt-3 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0f0f0f] p-5 shadow-2xl shadow-black/70"
          >
            {/* Category */}
            <h2
              id="explore-categories"
              className="text-sm font-semibold text-white/80"
            >
              Category
            </h2>

            <div
              role="group"
              aria-labelledby="explore-categories"
              className="mt-2 flex flex-wrap gap-2"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={category === c.value}
                  onClick={() => setCategory(c.value)}
                  className={`${focusClass} ${pillClass(category === c.value)}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Location */}
            <h2
              id="explore-locations"
              className="mt-5 text-sm font-semibold text-white/80"
            >
              Location
            </h2>

            <div
              role="group"
              aria-labelledby="explore-locations"
              className="mt-2 flex flex-wrap gap-2"
            >
              {locationOptions.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  aria-pressed={location === loc}
                  onClick={() => setLocation(loc)}
                  className={locationPillClass(location === loc)}
                >
                  {loc === "all" ? "All locations" : loc}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {/* Date filter */}
              <div className="min-w-0">
                <label
                  htmlFor="explore-date"
                  className="block text-sm font-semibold text-white/80"
                >
                  When
                </label>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    id="explore-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-describedby="explore-date-help"
                    className={`${inputClass} rounded-full py-2.5`}
                  />

                  {date && (
                    <button
                      type="button"
                      onClick={() => setDate("")}
                      className={`text-sm font-medium text-[#e8365d] hover:underline ${focusClass}`}
                    >
                      Clear date
                    </button>
                  )}
                </div>

                <p
                  id="explore-date-help"
                  className="mt-2 text-xs text-white/70"
                >
                  Events only, in Zambia time. Stays and activities are unaffected.
                </p>
              </div>

              {/* Price range */}
              <div className="min-w-0">
                <p
                  id="explore-price-context"
                  className="text-sm font-semibold text-white/80"
                >
                  Price range (K)

                  <span className="sr-only">
                    Zambian kwacha (ZMW)
                  </span>
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    aria-label="Minimum price"
                    aria-invalid={priceRangeInvalid}
                    aria-describedby={
                      priceRangeInvalid
                        ? "explore-price-context explore-price-error"
                        : "explore-price-context"
                    }
                    className={`${inputClass} flex-1 rounded-full py-2.5`}
                  />

                  <span className="shrink-0 text-white/70">
                    to
                  </span>

                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    aria-label="Maximum price"
                    aria-invalid={priceRangeInvalid}
                    aria-describedby={
                      priceRangeInvalid
                        ? "explore-price-context explore-price-error"
                        : "explore-price-context"
                    }
                    className={`${inputClass} flex-1 rounded-full py-2.5`}
                  />
                </div>

                {priceRangeInvalid && (
                  <p
                    id="explore-price-error"
                    className="mt-2 text-xs text-rose-300"
                  >
                    The minimum price is higher than the maximum.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
              <button
                type="button"
                onClick={clearFilters}
                className={`text-sm font-medium text-white/70 transition hover:text-white ${focusClass}`}
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className={`rounded-full bg-[#e8365d] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#e8365d]/90 ${focusClass}`}
              >
                Show {filteredListings.length}{" "}
                {filteredListings.length === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear everything (only once something is applied) */}
      {hasAnyFilter && (
        <button
          type="button"
          onClick={clearFilters}
          className={`mt-3 text-sm font-medium text-[#e8365d] transition hover:underline ${focusClass}`}
        >
          Clear all filters
        </button>
      )}

      {/* Listings */}
      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              Featured listings
            </h2>

            <p className="mt-1 text-sm text-white/70">
              Explore what is available right now.
            </p>
          </div>

          <span className="shrink-0 text-sm text-white/70">
            {filteredListings.length}{" "}
            {filteredListings.length === 1
              ? "listing"
              : "listings"}
          </span>
        </div>

        {/* Empty state */}
        {filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/30 bg-[#141414] p-12 text-center">
            <h3 className="text-lg font-semibold text-white">
              No listings found
            </h3>

            <p className="mt-2 text-sm text-white/70">
              Try changing your search, category, location,
              date or price range.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className={`mt-5 rounded-xl bg-[#e8365d] px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#e8365d]/95 ${focusClass}`}
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Listings grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <article
                key={listing.id}
                className="relative min-w-0"
              >
                {/* Clickable listing card */}
                <Link
                  href={`/user/listings/${listing.id}`}
                  className={`group block min-w-0 overflow-hidden rounded-xl bg-[#0f0f0f] ${focusClass}`}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden rounded-xl bg-[#1a1a1a]">
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/70">
                        Photo coming soon
                      </div>
                    )}

                    {/* Category badge */}
                    <span
                      className={`absolute left-2.5 top-2.5 rounded-full border bg-[#0f0f0f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        Object.prototype.hasOwnProperty.call(
                          CATEGORY_BADGE_CLASS,
                          listing.listing_type
                        )
                          ? CATEGORY_BADGE_CLASS[listing.listing_type]
                          : "border-white/40 text-white"
                      }`}
                    >
                      {listing.listing_type}
                    </span>
                  </div>

                  {/* Listing content */}
                  <div className="px-1 pb-3 pt-2.5">
                    <h3 className="line-clamp-2 break-words text-sm font-bold leading-snug text-white transition-colors duration-200 group-hover:text-[#e8365d]">
                      {listing.title}
                    </h3>

                    {/* Description */}
                    {listing.description && (
                      <p className="mt-1.5 line-clamp-2 break-words text-sm leading-5 text-white/70">
                        {listing.description}
                      </p>
                    )}

                    {/* Location */}
                    {listing.location && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-white/70">
                        <MapPin
                          size={16}
                          className="shrink-0 text-[#e8365d]"
                        />

                        <span className="min-w-0 break-words">
                          {listing.location}
                        </span>
                      </div>
                    )}

                    {/* Price and view */}
                    <div className="mt-2.5 flex flex-wrap items-end justify-between gap-2">
                      <p className="min-w-0 break-words text-sm font-bold text-white">
                        {listing.price !== null
                          ? `K${listing.price.toLocaleString("en-ZM")}`
                          : "Price on request"}

                        {listing.price !== null &&
                          PRICE_UNIT[listing.listing_type] && (
                            <span className="ml-1 text-xs font-medium text-white/70">
                              {PRICE_UNIT[listing.listing_type]}
                            </span>
                          )}
                      </p>

                      <span className="rounded-full border border-white/40 px-3 py-1 text-xs font-medium text-white/80 transition-colors group-hover:border-[#e8365d] group-hover:text-white">
                        View
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Save button sits outside the listing Link */}
                <div className="absolute right-3 top-3 z-10">
                  <SaveListingButton
                    listingId={listing.id}
                    initialSaved={savedIdSet.has(listing.id)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
