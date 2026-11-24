// Shared bits for the explore search bar: rotating placeholder
// ideas and the quick-search parser.

// The first one is what visitors see on arrival.
export const SEARCH_PLACEHOLDERS = [
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
  "Day trips from Kafue",
  "Nightlife in Lusaka",
]

export const PLACEHOLDER_INTERVAL_MS = 3000

// Words in a quick search that point to a category.
const CATEGORY_KEYWORDS: [string, string][] = [
  ["things to do", "activity"],
  ["activities", "activity"],
  ["activity", "activity"],
  ["stays", "stay"],
  ["stay", "stay"],
  ["lodges", "stay"],
  ["lodge", "stay"],
  ["guesthouses", "stay"],
  ["guesthouse", "stay"],
  ["hotels", "stay"],
  ["hotel", "stay"],
  ["cabins", "stay"],
  ["cabin", "stay"],
  ["events", "event"],
  ["event", "event"],
  ["concerts", "event"],
  ["concert", "event"],
  ["festivals", "event"],
  ["festival", "event"],
]

// Filler words that shouldn't have to match listing text.
const STOP_WORDS = new Set([
  "in", "at", "near", "me", "around", "the", "a", "an",
  "for", "to", "of", "and", "this", "weekend", "from",
])

export type ParsedQuery = {
  category: string | null
  location: string | null
  terms: string[]
}

// Reads a quick search like "stays in Lusaka" and picks out
// the category and location, leaving the rest as search terms.
export function parseQuery(
  text: string,
  locations: readonly string[]
): ParsedQuery {
  let rest = ` ${text.toLowerCase().replace(/\s+/g, " ").trim()} `
  let category: string | null = null
  let location: string | null = null

  // Longest names first so "South Luangwa" wins over shorter matches.
  const byLength = [...locations].sort((a, b) => b.length - a.length)

  for (const place of byLength) {
    const needle = ` ${place.toLowerCase()} `
    if (rest.includes(needle)) {
      location = place
      rest = rest.replace(needle, " ")
      break
    }
  }

  for (const [keyword, value] of CATEGORY_KEYWORDS) {
    const needle = ` ${keyword} `
    if (rest.includes(needle)) {
      category = value
      rest = rest.replace(needle, " ")
      break
    }
  }

  const terms = rest
    .split(" ")
    .filter((word) => word && !STOP_WORDS.has(word))

  return { category, location, terms }
}

// Every term must appear somewhere in the listing's text.
export function matchesTerms(
  listing: {
    title: string
    description: string | null
    location: string | null
    listing_type: string
  },
  terms: readonly string[]
): boolean {
  if (terms.length === 0) return true

  const text = [
    listing.title,
    listing.description,
    listing.location,
    listing.listing_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return terms.every((term) => text.includes(term))
}
