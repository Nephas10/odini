
import { CalendarDays, Clock, MapPin, Ticket, Users } from "lucide-react"
import BookNowButton from "./BookNowButton"
import ListingPhotoGallery from "@/components/listings/ListingPhotoGallery"

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
  photos?: string[] | null
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
    listing.price !== null
      ? `K${listing.price.toLocaleString("en-ZM")}`
      : "Price on request"

  // Format in Zambian time so the server's time zone
  // doesn't shift the event's displayed date.
  const eventDate = event?.event_time
    ? new Date(event.event_time)
    : null

  const dayNumber = eventDate?.toLocaleDateString("en-GB", {
    day: "numeric",
    timeZone: "Africa/Lusaka",
  })

  const month = eventDate?.toLocaleDateString("en-GB", {
    month: "short",
    timeZone: "Africa/Lusaka",
  })

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
      {/* Left: Event details */}
      <div className="space-y-8 lg:col-span-2">
        {/* Event photo gallery */}
        <ListingPhotoGallery
          title={listing.title}
          coverImage={listing.image_url}
          photos={listing.photos}
          badge="Event"
        />

        {/* Title + location on the left, date block on the far right */}
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {listing.title}
            </h1>

            {listing.location && (
              <p className="mt-2 flex items-center gap-2 text-white/50">
                <MapPin size={18} className="text-[#b81228]" />
                {listing.location}
              </p>
            )}
          </div>

          {eventDate && (
            <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-[#b81228] py-2 text-white">
              <span className="text-xs font-medium uppercase">
                {month}
              </span>

              <span className="text-2xl font-bold leading-none">
                {dayNumber}
              </span>
            </div>
          )}
        </div>

        {/* Quick facts */}
        <div className="flex flex-wrap gap-3">
          {/* Event date */}
              <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white/70">
            <CalendarDays size={18} className="text-[#b81228]" />
            {fullDate ?? "Date to be announced"}
          </div>

          {/* Event time */}
          {time && (
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white/70">
              <Clock size={18} className="text-[#b81228]" />
              {time}
            </div>
          )}

          {/* Event type */}
          {event?.event_type && (
              <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white/70">
              <Ticket size={18} className="text-[#b81228]" />
              {event.event_type}
            </div>
          )}

          {/* Capacity */}
          {event?.capacity !== null &&
            event?.capacity !== undefined && (
              <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white/70">
                <Users size={18} className="text-[#b81228]" />
                {event.capacity} capacity
              </div>
            )}
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <h2 className="text-lg font-semibold text-white">
              About this event
            </h2>

            <p className="mt-2 whitespace-pre-line leading-7 text-white/70">
              {listing.description}
            </p>
          </div>
        )}
      </div>

      {/* Right: Price and booking */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div>
          {/* Ticket price */}
          <p className="text-2xl font-bold text-[#b81228]">
            {price}

            {listing.price !== null && (
              <span className="ml-1 text-sm font-medium text-white/50">
                / ticket
              </span>
            )}
          </p>

          {/* Remaining tickets */}
          {spotsLeft !== null && (
            <p
              className={`mt-3 text-sm font-medium ${
                isSoldOut
                  ? "text-red-400"
                  : "text-white/80"
              }`}
            >
              {isSoldOut
                ? "Sold out"
                : `${spotsLeft} ${
                    spotsLeft === 1 ? "spot" : "spots"
                  } left`}
            </p>
          )}

          {/* Booking explanation */}
          <p className="mt-2 text-sm text-white/50">
            Booking is confirmed by the host on WhatsApp.
          </p>

          {/* Booking action */}
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
