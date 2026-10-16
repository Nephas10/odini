import { CalendarDays, Clock, MapPin, Ticket, Users } from "lucide-react"
import BookNowButton from "./BookNowButton"

type EventDetails = {
  event_type: string | null
  capacity: number | null
  available_slots: number | null
  event_time: string | null
}

type EventListing = {
  id: string
  title: string
  description: string | null
  price: number | null
  location: string | null
  image_url: string | null
  events?: EventDetails | EventDetails[] | null
}
type Props = {
  listing: EventListing
}

// Shows an event listing. Takes data in, renders it. No fetching here.
export default function EventView({ listing }: Props) {
 const event = Array.isArray(listing.events)
  ? listing.events[0]
  : listing.events
  const price =
    listing.price !== null ? `K${listing.price.toLocaleString("en-ZM")}` : "Price on request"

  // Format in Zambian time, so the server's own time zone doesn't shift the date
  const eventDate = event?.event_time ? new Date(event.event_time) : null
  const dayNumber = eventDate?.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Africa/Lusaka" })
  const month = eventDate?.toLocaleDateString("en-GB", { month: "short", timeZone: "Africa/Lusaka" })
  const fullDate = eventDate?.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lusaka",
  })
  const time = eventDate?.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lusaka",
  })

  const spotsLeft = event?.available_slots ?? null
  const isSoldOut = spotsLeft === 0

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
            Event
          </span>
        </div>

        {/* Date block + title */}
        <div className="flex items-start gap-5">
          {eventDate && (
            <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-[#7A1F2B] py-2 text-white">
              <span className="text-xs font-medium uppercase">{month}</span>
              <span className="text-2xl font-bold leading-none">{dayNumber}</span>
            </div>
          )}

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
        </div>

        {/* Quick facts */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-[#F7EDEF] px-4 py-3 text-sm font-medium text-[#7A1F2B]">
            <CalendarDays size={18} />
            {fullDate ?? "Date to be announced"}
          </div>

          {time && (
            <div className="flex items-center gap-2 rounded-xl bg-[#F7EDEF] px-4 py-3 text-sm font-medium text-[#7A1F2B]">
              <Clock size={18} />
              {time}
            </div>
          )}

          {event?.event_type && (
            <div className="flex items-center gap-2 rounded-xl bg-[#F7EDEF] px-4 py-3 text-sm font-medium capitalize text-[#7A1F2B]">
              <Ticket size={18} />
              {event.event_type}
            </div>
          )}

          {event?.capacity !== null && event?.capacity !== undefined && (
            <div className="flex items-center gap-2 rounded-xl bg-[#F7EDEF] px-4 py-3 text-sm font-medium text-[#7A1F2B]">
              <Users size={18} />
              {event.capacity} capacity
            </div>
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">About this event</h2>
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
              <span className="ml-1 text-sm font-medium text-gray-500">/ ticket</span>
            )}
          </p>

          {spotsLeft !== null && (
            <p
              className={`mt-3 text-sm font-medium ${
                isSoldOut ? "text-red-600" : "text-gray-700"
              }`}
            >
              {isSoldOut
                ? "Sold out"
                : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-500">
            Booking is confirmed by the host on WhatsApp.
          </p>
          <BookNowButton
            listingId={listing.id}
            label="Get tickets"
            disabled={isSoldOut}
            disabledLabel="Sold out"
          />
        </div>
      </aside>
    </div>
  )
}