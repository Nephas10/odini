
import Link from "next/link"
import { redirect } from "next/navigation"
import { Bookmark, MapPin, ArrowRight } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import SaveListingButton from "@/components/saved/SaveListingButton"

const PRICE_UNIT: Record<string, string> = {
  stay: "/ night",
  event: "/ ticket",
  activity: "/ person",
}

type Listing = {
  id: string
  title: string
  description: string | null
  listing_type: string
  price: number | null
  location: string | null
  image_url: string | null
  is_active: boolean
}

type SavedRow = {
  listing_id: string
  created_at: string
  listings: Listing | Listing[] | null
}

export default async function SavedListingsPage() {
  const supabase = await createClient()

  // 1. Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/user/saved")
  }

  // 2. Get saved listings belonging to this user
  const { data, error } = await supabase
    .from("saved_listings")
    .select(`
      listing_id,
      created_at,
      listings!inner (
        id,
        title,
        description,
        listing_type,
        price,
        location,
        image_url,
        is_active
      )
    `)
    .eq("user_id", user.id)
    .eq("listings.is_active", true)
    .order("created_at", { ascending: false })

  // 3. Normalize related listing data
  const rows = (data ?? []) as SavedRow[]

  const listings = rows
    .map((item) => {
      const listing = Array.isArray(item.listings)
        ? item.listings[0]
        : item.listings

      return listing
    })
    .filter((listing): listing is Listing => Boolean(listing))

  return (
    <main className="min-h-screen bg-black text-white">

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

        {/* Page heading */}
        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-[#e8365d]">
            Your collection
          </p>

          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <Bookmark
              size={30}
              fill="#e8365d"
              className="text-[#e8365d]"
            />
            Saved Listings
          </h1>

          <p className="mt-3 max-w-2xl text-white/60">
            All your favourite stays, events and activities
            in one place.
          </p>

        </div>

        {/* Error */}
        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-[#141414] p-8"
          >
            <h2 className="font-semibold text-white">
              Unable to load saved listings
            </h2>

            <p className="mt-2 text-sm text-white/60">
              Please refresh the page and try again.
            </p>
          </div>
        ) : listings.length === 0 ? (

          /* Empty state */
          <div className="rounded-2xl border border-dashed border-white/20 bg-[#111111] px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8365d]/10">
              <Bookmark
                size={28}
                className="text-[#e8365d]"
              />
            </div>

            <h2 className="mt-6 text-xl font-bold text-white">
              No saved listings yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
              When you find something interesting, tap the heart
              icon to save it here for later.
            </p>

            <Link
              href="/user"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f05272]"
            >
              Explore listings
              <ArrowRight size={16} />
            </Link>

          </div>

        ) : (
          <>
            {/* Listing count */}
            <div className="mb-6 flex items-center justify-between gap-4">

              <p className="text-sm text-white/60">
                {listings.length} saved{" "}
                {listings.length === 1
                  ? "listing"
                  : "listings"}
              </p>

              <Link
                href="/user"
                className="text-sm font-semibold text-[#e8365d] hover:underline"
              >
                Explore more
              </Link>

            </div>

            {/* Saved listing cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition hover:border-white/20"
                >

                  {/* Clickable listing */}
                  <Link
                    href={`/user/listings/${listing.id}`}
                    className="group block"
                  >

                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-[#1a1a1a]">

                      {listing.image_url ? (
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white/60">
                          Photo coming soon
                        </div>
                      )}

                      {/* Category */}
                      <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                        {listing.listing_type}
                      </span>

                    </div>

                    {/* Content */}
                    <div className="p-5">

                      <h2 className="line-clamp-2 text-lg font-bold text-white transition group-hover:text-[#e8365d]">
                        {listing.title}
                      </h2>

                      {listing.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
                          {listing.description}
                        </p>
                      )}

                      {listing.location && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
                          <MapPin
                            size={16}
                            className="shrink-0 text-[#e8365d]"
                          />
                          <span>{listing.location}</span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

                        <p className="font-bold text-white">
                          {listing.price !== null
                            ? `K${listing.price.toLocaleString("en-ZM")}`
                            : "Price on request"}

                          {listing.price !== null &&
                            PRICE_UNIT[listing.listing_type] && (
                              <span className="ml-1 text-xs font-medium text-white/60">
                                {PRICE_UNIT[listing.listing_type]}
                              </span>
                            )}
                        </p>

                        <span className="text-xs font-medium text-[#e8365d]">
                          View details →
                        </span>

                      </div>

                    </div>
                  </Link>

                  {/* Remove from saved */}
                  <div className="absolute right-3 top-3 z-10">
                    <SaveListingButton
                      listingId={listing.id}
                      initialSaved={true}
                    />
                  </div>

                </article>
              ))}

            </div>
          </>
        )}

      </div>
    </main>
  )
}
 