
import { createClient } from "@/lib/supabase/server"
import PublicExploreClient from "./PublicExploreClient"

const GUEST_LISTING_LIMIT = 7

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function PublicExplorePage({
    searchParams,
}: Props) {
  const supabase = await createClient()
  
  const {category} = await searchParams

  const validCategories = [
    "all",
    "stay",
    "event",
    "activity",
    "service",
  ]

  const initialCategory =
    category && validCategories.includes(category)
      ? category
      : "all"
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
    initialCategory={initialCategory}
  />

  )
}
