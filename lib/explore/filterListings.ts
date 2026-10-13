import { matchesDestination } from "./locations.ts"
import { getEventDayBounds, matchesEventDay, type EventSchedule } from "./eventDates.ts"

export type FilterableListing = {
  listing_type: string
  title: string
  description: string | null
  price: number | null
  location: string | null
  eventSchedule?: EventSchedule | null
}

export type ExploreFilters = {
  category: string
  search: string
  location: string
  minPrice: string
  maxPrice: string
  date?: string
}

// Preserve the existing client predicates, including Number conversion and null prices.
export function filterListings<T extends FilterableListing>(
  listings: readonly T[],
  { category, search, location, minPrice, maxPrice, date = "" }: ExploreFilters
): T[] {
  const min = minPrice === "" ? null : Number(minPrice)
  const max = maxPrice === "" ? null : Number(maxPrice)
  const hasPriceFilter = min !== null || max !== null
  const dayBounds = date === "" ? null : getEventDayBounds(date)

  return listings.filter((listing) => {
    const matchesCategory = category === "all" || listing.listing_type === category
    const matchesLocation = location === "all" || matchesDestination(listing.location, location)

    const searchText = search.trim().toLowerCase()
    const matchesSearch =
      !searchText ||
      listing.title.toLowerCase().includes(searchText) ||
      listing.description?.toLowerCase().includes(searchText) ||
      listing.location?.toLowerCase().includes(searchText)

    const matchesPrice =
      !hasPriceFilter ||
      (listing.price !== null &&
        (min === null || listing.price >= min) &&
        (max === null || listing.price <= max))

    const matchesDate = date === "" || listing.listing_type !== "event" ||
      matchesEventDay(listing.eventSchedule, dayBounds)

    return matchesCategory && matchesLocation && matchesSearch && matchesPrice && matchesDate
  })
}
