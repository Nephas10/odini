
import { createClient } from "@/lib/supabase/server"
import PublicExploreClient from "./PublicExploreClient"

const GUEST_LISTING_LIMIT = 7

export default async function PublicExplorePage() {
  const supabase = await createClient()

  // Check whether the visitor is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoggedIn = !!user

  // Only retrieve published listings
  let query = supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      listing_type,
      location,
      price,
      image_url
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Guests receive only 7 listings.
  // Fetch one extra to check whether more exist.
  if (!isLoggedIn) {
    query = query.limit(GUEST_LISTING_LIMIT + 1)
  }

  const { data, error } = await query

  if (error) {
    console.error(
      "Public Explore error:",
      error.message
    )
  }

  const listings = data ?? []

  const hasMoreListings =
    !isLoggedIn &&
    listings.length > GUEST_LISTING_LIMIT

  const visibleListings = isLoggedIn
    ? listings
    : listings.slice(0, GUEST_LISTING_LIMIT)

  return (
    <PublicExploreClient
      listings={visibleListings}
      hasError={Boolean(error)}
      isLoggedIn={isLoggedIn}
      hasMoreListings={hasMoreListings}
    />
  )
}
