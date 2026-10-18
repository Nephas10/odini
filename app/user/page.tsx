import { getListings } from "./action"
import ListingsClient from "./ListingsClient"
import { normalizeEventSchedule } from "@/lib/explore/eventDates"
import { unstable_rethrow } from "next/navigation"

// Landing page: get the listings, show the intro, hand the rest to ListingsClient.
export default async function UserPage() {
  const result = await getListings().catch((error: unknown) => {
    unstable_rethrow(error)
    // Keep discovery failures local; do not expose raw backend error details.
    console.error("Explore discovery retrieval failed")
    return { success: false, listings: [], error: null }
  })

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Intro */}
      <section className="bg-black">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#e8365d]">
            Explore Zambia
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Discover something new
          </h1>

          <p className="mt-3 max-w-2xl text-white/70">
            Find stays, events and activities around you, and book in a few taps.
          </p>
        </div>
      </section>

      {/* Search, categories and listings */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        {result.success ? (
          <ListingsClient listings={(result.listings ?? []).map((listing) => ({
            ...listing, eventSchedule: normalizeEventSchedule(listing.events),
          }))} />
        ) : (
          <section role="alert" className="rounded-2xl border border-white/20 bg-[#141414] p-8">
            <h2 className="text-lg font-semibold text-white">Unable to load listings</h2>
            <p className="mt-2 text-sm text-white/70">
              Please try refreshing this page. Your listings could not be retrieved.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
