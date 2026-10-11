import { MapPin, Users } from "lucide-react"
import BookNowButton from "./BookNowButton"

type StayListing = {
  id: string
  title: string
  description: string | null
  price: number | null
  location: string | null
  image_url: string | null
  stays?: { max_guests: number | null }[] | null
}

type Props = {
  listing: StayListing
}

// Shows a stay listing. Takes data in, renders it. No fetching here.
export default function StayView({ listing }: Props) {
  const maxGuests = listing.stays?.[0]?.max_guests ?? null
  const price =
    listing.price !== null ? `K${listing.price.toLocaleString("en-ZM")}` : "Price on request"

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      {/* Left: details */}
      <div className="space-y-8 lg:col-span-2">
        {/* Photo */}
        <div className="relative h-72 overflow-hidden rounded-2xl bg-[#F7EDEF] sm:h-96">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#7A1F2B]/60">
              Photo coming soon
            </div>
          )}

          <span className="absolute left-4 top-4 rounded-full bg-[#7A1F2B] px-3 py-1 text-sm font-medium text-white">
            Stay
          </span>
        </div>

        {/* Title and location */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {listing.title}
          </h1>
          {listing.location && (
            <p className="mt-2 flex items-center gap-2 text-gray-500">
              <MapPin size={18} className="text-[#7A1F2B]" />
              {listing.location}
            </p>
          )}
        </div>

        {/* Quick facts */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-[#F7EDEF] px-4 py-3 text-sm font-medium text-[#7A1F2B]">
            <Users size={18} />
            {maxGuests !== null
              ? `Up to ${maxGuests} ${maxGuests === 1 ? "guest" : "guests"}`
              : "Guest limit not set"}
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">About this stay</h2>
            <p className="mt-2 whitespace-pre-line leading-7 text-gray-600">
              {listing.description}
            </p>
          </div>
        )}
      </div>

      {/* Right: price card (booking form goes here later) */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-[#7A1F2B]/15 bg-white p-6 shadow-sm">
          <p className="text-2xl font-bold text-[#7A1F2B]">
            {price}
            {listing.price !== null && (
              <span className="ml-1 text-sm font-medium text-gray-500">/ night</span>
            )}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Booking is confirmed by the host on WhatsApp.
          </p>
          <BookNowButton listingId={listing.id} />
        </div>
      </aside>
    </div>
  )
}