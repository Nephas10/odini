import { getListings } from "./action"
import ListingsClient from "./ListingsClient"

// Landing page: get the listings, show the intro, hand the rest to ListingsClient.
export default async function UserPage() {
  const result = await getListings()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Intro */}
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F7EDEF]/80">
            Explore Zambia
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Discover something new
          </h1>

          <p className="mt-3 max-w-2xl text-[#F7EDEF]/90">
            Find stays, events and activities around you, and book in a few taps.
          </p>
        </div>
      </section>

      {/* Search, categories and listings. Pulled up to overlap the burgundy band */}
      <div className="mx-auto -mt-8 max-w-7xl px-4 pb-12 sm:px-6">
        <ListingsClient listings={result.listings ?? []} />
      </div>
    </main>
  )
}