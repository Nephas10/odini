"use client"

import { useMemo, useState } from "react"
import { MapPin, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { filterListings } from "@/lib/explore/filterListings"
import { getDestinationOptions } from "@/lib/explore/locations"
import type { EventSchedule } from "@/lib/explore/eventDates"

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

const inputClass =
  "w-full rounded-xl border border-white/40 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/60 focus:border-[#e8365d] focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#e8365d] [color-scheme:dark]"

const focusClass =
  "focus-visible:ring-2 focus-visible:ring-[#e8365d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"

// Shows the search, filters and listing cards. Gets the listings from the page; never fetches.
export default function ListingsClient({ listings }: Props) {
  const [category, setCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [date, setDate] = useState("")

  // Offer confidently mapped cities/destinations; cards retain the full location.
  const locations = useMemo(
    () => getDestinationOptions(listings),
    [listings]
  )

  const min = minPrice === "" ? null : Number(minPrice)
  const max = maxPrice === "" ? null : Number(maxPrice)
  const hasPriceFilter = min !== null || max !== null
  const priceRangeInvalid = min !== null && max !== null && min > max

  const filteredListings = filterListings(listings, {
    category, search, location, minPrice, maxPrice, date,
  })

  const hasAnyFilter =
    category !== "all" || location !== "all" || search !== "" || hasPriceFilter || date !== ""

  function clearFilters() {
    setSearch("")
    setCategory("all")
    setLocation("all")
    setMinPrice("")
    setMaxPrice("")
    setDate("")
  }

  return (
    <>
      {/* Search & filters */}
      <section className="rounded-2xl border border-white/15 bg-[#0f0f0f] p-4 sm:p-5">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-white">What are you looking for?</h2>
          <p className="mt-1 text-sm text-white/70">
            Search by name, description or location.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8365d]"
            />
            <input
              type="text"
              aria-label="Search listings"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stays, events, activities..."
              className={`${inputClass} pl-12`}
            />
          </div>

          {/* Location */}
          <select
            aria-label="Select location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={`${inputClass} sm:w-52`}
          >
            <option value="all" className="bg-[#0f0f0f] text-white">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc} className="bg-[#0f0f0f] text-white">
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Prototype's specific-date control; date applies only to Events. */}
        <div className="mt-3">
          <label htmlFor="explore-date" className="text-sm font-medium text-white/80">When</label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input id="explore-date" type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-describedby="explore-date-help" className={`${inputClass} sm:w-52`} />
            {date && (
              <button type="button" onClick={() => setDate("")}
                className={`text-sm font-medium text-[#e8365d] hover:underline ${focusClass}`}>Clear date</button>
            )}
          </div>
          <p id="explore-date-help" className="mt-2 text-xs text-white/70">
            Events only, in Zambia time. Stays and activities are unaffected.
          </p>
        </div>

        {/* Price range */}
        <div className="mt-3 border-t border-white/15 pt-3">
          <p id="explore-price-context" className="flex items-center gap-2 text-sm font-medium text-white/80">
            <SlidersHorizontal size={16} className="text-[#e8365d]" />
            Price range (K)
            <span className="sr-only">Zambian kwacha (ZMW)</span>
          </p>

          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              aria-label="Minimum price"
              aria-invalid={priceRangeInvalid}
              aria-describedby={priceRangeInvalid ? "explore-price-context explore-price-error" : "explore-price-context"}
              className={`${inputClass} sm:w-40`}
            />
            <span className="text-white/70">to</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              aria-label="Maximum price"
              aria-invalid={priceRangeInvalid}
              aria-describedby={priceRangeInvalid ? "explore-price-context explore-price-error" : "explore-price-context"}
              className={`${inputClass} sm:w-40`}
            />
          </div>

          {priceRangeInvalid && (
            <p id="explore-price-error" className="mt-2 text-xs text-rose-300">
              The minimum price is higher than the maximum.
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="explore-categories" className="text-lg font-semibold text-white">Categories</h2>

          {hasAnyFilter && (
            <button
              onClick={clearFilters}
              className={`text-sm font-medium text-[#e8365d] transition hover:underline ${focusClass}`}
            >
              Clear all filters
            </button>
          )}
        </div>

        <div role="group" aria-labelledby="explore-categories" className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              aria-pressed={category === c.value}
              onClick={() => setCategory(c.value)}
              className={`${focusClass} ${
                category === c.value
                  ? "rounded-full bg-[#e8365d] px-5 py-2.5 text-sm font-medium text-black shadow-sm"
                  : "rounded-full border border-white/40 bg-[#0f0f0f] px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Featured listings</h2>
            <p className="mt-1 text-sm text-white/70">Explore what is available right now.</p>
          </div>

          <span className="text-sm text-white/70">
            {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"}
          </span>
        </div>

        {filteredListings.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-white/30 bg-[#141414] p-12 text-center">
            <h3 className="text-lg font-semibold text-white">No listings found</h3>
            <p className="mt-2 text-sm text-white/70">
              Try changing your search, category, location, date or price range.
            </p>
            <button
              onClick={clearFilters}
              className={`mt-5 rounded-xl bg-[#e8365d] px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#e8365d]/95 ${focusClass}`}
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Listing grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/user/listings/${listing.id}`}
                className={`group overflow-hidden rounded-2xl bg-[#0f0f0f] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${focusClass}`}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-[#1a1a1a]">
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/70">
                      Photo coming soon
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full bg-[#e8365d] px-3 py-1 text-xs font-semibold capitalize text-black">
                    {listing.listing_type}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="truncate text-lg font-semibold text-white group-hover:text-[#e8365d]">
                    {listing.title}
                  </h3>

                  {listing.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/70">
                      {listing.description}
                    </p>
                  )}

                  {listing.location && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
                      <MapPin size={16} className="shrink-0 text-[#e8365d]" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                  )}

                  {/* Price + view */}
                  <div className="mt-5 flex items-end justify-between border-t border-white/15 pt-4">
                    <p className="text-lg font-bold text-[#e8365d]">
                      {listing.price !== null
                        ? `K${listing.price.toLocaleString("en-ZM")}`
                        : "Price on request"}
                      {listing.price !== null && PRICE_UNIT[listing.listing_type] && (
                        <span className="ml-1 text-xs font-medium text-white/70">
                          {PRICE_UNIT[listing.listing_type]}
                        </span>
                      )}
                    </p>

                    <span className="rounded-lg bg-[#e8365d] px-4 py-2 text-sm font-medium text-black transition group-hover:bg-[#e8365d]/95">
                      View
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
