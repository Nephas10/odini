// Decides the order of the For You feed using simple, readable rules.
// No database, no UI: listings and the user's signals go in, a sorted list comes out.
// To tune the feed, change the POINTS below.

export type FypListing = {
  id: string
  title: string
  description: string | null
  listing_type: string
  price: number | null
  location: string | null
  image_url: string | null
  created_at: string
  // Only for events
  event_time: string | null
  available_slots: number | null
}

export type UserSignals = {
  // How many times they've booked each type, e.g. { stay: 2, event: 1 }
  bookedTypes: Record<string, number>
  // Locations of listings they've booked before
  bookedLocations: string[]
  // Listings they've already booked
  bookedListingIds: Set<string>
  // From their profile
  homeLocation: string | null
}

export type RankedListing = FypListing & {
  // Short line shown on the card, e.g. "Happening this week"
  reason: string
}

const POINTS = {
  favouriteType: 3, // the type they book most
  bookedTypeBefore: 1.5, // any other type they've booked
  nearHome: 2.5, // in their profile location
  placeTheyVisited: 1.5, // somewhere they've booked before
  eventThisWeek: 3,
  eventThisMonth: 1.5,
  newListing: 1, // added in the last 14 days
  alreadyBooked: -2, // still shown, just lower down
  soldOut: -4,
}

const DAY = 86_400_000

function sameLocation(a: string | null, b: string | null) {
  if (!a || !b) return false
  const x = a.trim().toLowerCase()
  const y = b.trim().toLowerCase()
  return x.includes(y) || y.includes(x)
}

const TYPE_WORD: Record<string, string> = {
  stay: "stays",
  event: "events",
  activity: "activities",
}

export function rankForYou(
  listings: FypListing[],
  signals: UserSignals,
  now: Date = new Date()
): RankedListing[] {
  const favouriteType = Object.entries(signals.bookedTypes).sort((a, b) => b[1] - a[1])[0]?.[0]
  const nowMs = now.getTime()

  const scored = listings
    // Events that have already happened don't belong in the feed
    .filter((l) => !(l.listing_type === "event" && l.event_time && new Date(l.event_time).getTime() < nowMs))
    .map((listing) => {
      let score = 0
      // Each rule that applies adds points and a possible reason; the biggest reason wins
      const reasons: { points: number; text: string }[] = []

      const add = (points: number, text: string) => {
        score += points
        if (points > 0) reasons.push({ points, text })
      }

      // What they like to book
      if (listing.listing_type === favouriteType) {
        add(POINTS.favouriteType, `Because you book ${TYPE_WORD[listing.listing_type] ?? "these"}`)
      } else if (signals.bookedTypes[listing.listing_type]) {
        add(POINTS.bookedTypeBefore, `More ${TYPE_WORD[listing.listing_type] ?? "like this"} for you`)
      }

      // Where they are, and where they've been
      if (sameLocation(listing.location, signals.homeLocation)) {
        add(POINTS.nearHome, `Near you in ${listing.location}`)
      } else if (signals.bookedLocations.some((loc) => sameLocation(listing.location, loc))) {
        add(POINTS.placeTheyVisited, `Back to ${listing.location}`)
      }

      // Events coming up soon
      if (listing.listing_type === "event" && listing.event_time) {
        const daysAway = (new Date(listing.event_time).getTime() - nowMs) / DAY
        if (daysAway <= 7) add(POINTS.eventThisWeek, "Happening this week")
        else if (daysAway <= 30) add(POINTS.eventThisMonth, "Coming up this month")
      }

      // Fresh listings
      if ((nowMs - new Date(listing.created_at).getTime()) / DAY <= 14) {
        add(POINTS.newListing, "New on ODINI")
      }

      // Push down things they can't or already did book
      if (signals.bookedListingIds.has(listing.id)) add(POINTS.alreadyBooked, "")
      if (listing.listing_type === "event" && listing.available_slots === 0) add(POINTS.soldOut, "")

      const best = reasons.sort((a, b) => b.points - a.points)[0]
      const isSoldOut = listing.listing_type === "event" && listing.available_slots === 0

      return {
        ...listing,
        score,
        reason: isSoldOut ? "Sold out" : best?.text ?? "Popular on ODINI",
      }
    })

  // Highest score first; newest first when scores tie
  scored.sort(
    (a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Drop the internal score before handing the list to the page
  return scored.map(({ score: _score, ...rest }) => rest)
}