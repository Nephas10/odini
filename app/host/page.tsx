import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function HostDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>You must be logged in.</p>
      </div>
    )
  }

  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, title, listing_type, price, is_active, created_at")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })

  const totalListings = listings?.length ?? 0
  const activeListings =
    listings?.filter((listing) => listing.is_active).length ?? 0
  const draftListings =
    listings?.filter((listing) => !listing.is_active).length ?? 0

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Host Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Welcome back
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your listings and bookings from here.
            </p>
          </div>

          <Link
            href="/host/listings/new"
            className="w-fit rounded-full bg-[#e8365d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d02d50]"
          >
            + Create Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Listings
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalListings}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {activeListings}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Drafts
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {draftListings}
            </p>
          </div>

        </div>

        {/* Listings */}
        <section className="mt-10">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Your Listings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage the experiences you offer.
              </p>
            </div>

            <Link
              href="/host/listings"
              className="text-sm font-semibold text-[#e8365d]"
            >
              View all
            </Link>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl bg-white p-6 text-sm text-red-500">
              Unable to load your listings.
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listings.slice(0, 6).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/host/listings/${listing.id}/edit`}
                  className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <span className="text-xs font-semibold uppercase text-[#e8365d]">
                        {listing.listing_type}
                      </span>

                      <h3 className="mt-2 font-semibold text-gray-900">
                        {listing.title}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        listing.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {listing.is_active ? "Active" : "Draft"}
                    </span>

                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    {listing.price != null
                      ? `K${listing.price.toLocaleString()}`
                      : "Price on request"}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-white p-10 text-center shadow-sm">
              <h3 className="font-semibold text-gray-900">
                No listings yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first listing to start offering experiences.
              </p>

              <Link
                href="/host/listings/new"
                className="mt-5 inline-block rounded-full bg-[#e8365d] px-5 py-3 text-sm font-semibold text-white"
              >
                Create your first listing
              </Link>
            </div>
          )}

        </section>

      </div>
    </main>
  )
}