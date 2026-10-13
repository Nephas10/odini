import { createClient } from "@/lib/supabase/server"
import FYPFeed from "./FYPFeed"
import { rankForYou, type FypListing, type UserSignals } from "./ranking"

// Supabase types joined rows as a list, but a booking has one listing
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

// This page only gathers data and hands it on: the rules live in ranking.ts,
// the swipe view lives in FYPFeed.
export default async function FYPPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Active listings (with event date and spots, for the event rules)
  const { data: rows, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      listing_type,
      price,
      location,
      image_url,
      created_at,
      events ( event_time, available_slots )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("FYP listings error:", error)
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p className="text-white/60">Unable to load listings.</p>
      </div>
    )
  }

  const listings: FypListing[] = (rows ?? []).map(({ events, ...listing }) => {
    const event = one(events)
    return {
      ...listing,
      event_time: event?.event_time ?? null,
      available_slots: event?.available_slots ?? null,
    }
  })

  // 2. What we know about this user (empty if anything is missing)
  const signals: UserSignals = {
    bookedTypes: {},
    bookedLocations: [],
    bookedListingIds: new Set(),
    homeLocation: null,
  }

  if (user) {
    const [{ data: profile }, { data: bookings }] = await Promise.all([
      supabase.from("profiles").select("location").eq("id", user.id).maybeSingle(),
      supabase
        .from("bookings")
        .select("listing_id, status, listings ( listing_type, location )")
        .eq("user_id", user.id),
    ])

    signals.homeLocation = profile?.location ?? null

    for (const booking of bookings ?? []) {
      signals.bookedListingIds.add(booking.listing_id)
      if (booking.status === "cancelled") continue

      const listing = one(booking.listings)
      if (listing?.listing_type) {
        signals.bookedTypes[listing.listing_type] =
          (signals.bookedTypes[listing.listing_type] ?? 0) + 1
      }
      if (listing?.location) signals.bookedLocations.push(listing.location)
    }
  }

  // 3. Rank and hand to the feed
  return <FYPFeed listings={rankForYou(listings, signals)} />
}