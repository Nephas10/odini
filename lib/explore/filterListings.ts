import { matchesDestination } from "./locations.ts"

export type FilterableListing = {
  listing_type: string
  title: string
  description: string | null
  price: number | null
  location: string | null
}

export type ExploreFilters = {
  category: string
  search: string
  location: string
  minPrice: string
  maxPrice: string
}

// Preserve the existing client predicates, including Number conversion and null prices.
export function filterListings<T extends FilterableListing>(
  listings: readonly T[],
  { category, search, location, minPrice, maxPrice }: ExploreFilters
): T[] {
  const min = minPrice === "" ? null : Number(minPrice)
  const max = maxPrice === "" ? null : Number(maxPrice)
  const hasPriceFilter = min !== null || max !== null

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

    return matchesCategory && matchesLocation && matchesSearch && matchesPrice
  })
}
