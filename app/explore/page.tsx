
import { createClient } from "@/lib/supabase/server"
import PublicExploreClient from "./PublicExploreClient"

const GUEST_LISTING_LIMIT = 7

type Props = {
  searchParams: Promise<{
    category?: string
  }>
}

const VALID_CATEGORIES = [
  "all",
  "stay",
  "event",
  "activity",
  "service",
]

export default async function PublicExplorePage({
  searchParams,
}: Props) {
  const supabase = await createClient()

  // Read the category supplied by the landing page
  const { category } = await searchParams

  const initialCategory =
    category && VALID_CATEGORIES.includes(category)
      ? category
      : "all"

  // Authentication determines how many listings
  // the visitor can browse.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoggedIn = !!user

  // Only published listings are discoverable.
  // Match the ordering used by the homepage and
  // public listing details page.
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
    .order("id", { ascending: false })

  // Guests can see only seven listings.
  // Fetch one extra to know whether to show
  // the invitation to explore more.
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
      key={initialCategory}
      listings={visibleListings}
      hasError={Boolean(error)}
      isLoggedIn={isLoggedIn}
      hasMoreListings={hasMoreListings}
      initialCategory={initialCategory}
    />
  )
}
