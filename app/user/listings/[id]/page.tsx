import Link from "next/link"
import { getListingById } from "../../action"
import StayView from "./StayView"
import EventView from "./EventView"
import ActivityView from "./ActivityView"

type Props = {
  params: Promise<{ id: string }>
}

// This page only does two things: get the listing, and pick which view shows it.
export default async function ListingDetailsPage({ params }: Props) {
  const { id } = await params
  const result = await getListingById(id)

  if (!result.success || !result.listing) {
    return <ListingNotFound />
  }

  const listing = result.listing

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {listing.listing_type === "stay" && <StayView listing={listing} />}
        {listing.listing_type === "event" && <EventView listing={listing} />}
        {listing.listing_type === "activity" && <ActivityView listing={listing} />}
      </div>
    </main>
  )
}

function ListingNotFound() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-6">
        <div className="w-full rounded-2xl border border-[#7A1F2B]/15 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Listing not found</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            This listing may no longer be available or the link may be incorrect.
          </p>
          <Link
            href="/user"
            className="mt-6 inline-flex rounded-xl bg-[#7A1F2B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5E1721]"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    </main>
  )
}