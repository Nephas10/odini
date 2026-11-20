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
    <main className="min-h-screen bg-[#121012] text-white">
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
    <main className="min-h-screen bg-[#121012] text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-6">
        <div className="w-full rounded-2xl bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Listing not found</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
            This listing may no longer be available or the link may be incorrect.
          </p>
          <Link
            href="/user"
            className="mt-6 inline-flex rounded-xl bg-[#b81228] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#960f21]"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    </main>
  )
}