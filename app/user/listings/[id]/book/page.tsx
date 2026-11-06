import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { getListingById } from "../../../action"
import StayBookingForm from "./StayBookingForm"
import EventBookingForm from "./EventBookingForm"
import ActivityBookingForm from "./ActivityBookingForm"
import { createStayBooking, createEventBooking, createActivityBooking } from "./action"


type Props = {
  params: Promise<{ id: string }>
}

const PRICE_UNIT = {
  stay: "night",
  event: "ticket",
  activity: "person",
} as const

const PAGE_TITLE = {
  stay: "Book your stay",
  event: "Get your tickets",
  activity: "Book your activity",
} as const

// This page only does two things: get the listing, and lay out the booking screen.
// The form for each listing type plugs in where marked below.
export default async function BookingPage({ params }: Props) {
  const { id } = await params
  const result = await getListingById(id)

  if (!result.success || !result.listing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121012] text-white px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Listing not found</h1>
          <Link
            href="/user"
            className="mt-6 inline-flex rounded-xl bg-[#e8365d] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#d02d50]"
          >
            Back to Explore
          </Link>
        </div>
      </main>
    )
  }

  const listing = result.listing
  const type = listing.listing_type as keyof typeof PRICE_UNIT
  const price =
    listing.price !== null ? `K${listing.price.toLocaleString("en-ZM")}` : "Price on request"

  return (
    <main className="min-h-screen bg-[#121012] text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Back to listing */}
        <Link
          href={`/user/listings/${listing.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#FF8CA5] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to listing
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
          {PAGE_TITLE[type] ?? "Make a booking"}
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          {/* Left: the form */}
          <section className="rounded-2xl border border-white/10 bg-[#1C1A1D] p-6 shadow-sm lg:col-span-3">
            {/* Booking forms go here: StayBookingForm, EventBookingForm, ActivityBookingForm */}
            {listing.listing_type === "stay" ? (
              <StayBookingForm
                listingId={listing.id}
                price={listing.price}
                maxGuests={listing.stays?.[0]?.max_guests ?? null}
                action={createStayBooking}
              />
            ) : listing.listing_type === "event" ? (
              <EventBookingForm
                listingId={listing.id}
                price={listing.price}
                availableSlots={listing.events?.[0]?.available_slots ?? null}
                action={createEventBooking}
              />
            ) : listing.listing_type === "activity" ? (
              <ActivityBookingForm
                listingId={listing.id}
                price={listing.price}
                maxParticipants={listing.activities?.[0]?.max_participants ?? null}
                action={createActivityBooking}
              />
            ) : (
              <p className="text-sm text-white/50">Booking form coming next.</p>
            )}
            
          </section>

          {/* Right: what they're booking */}
          <aside className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1C1A1D] shadow-sm lg:sticky lg:top-20">
              <div className="h-40 bg-[#242024]">
                {listing.image_url && (
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#FF8CA5]">
                  {listing.listing_type}
                </span>
                <h2 className="mt-1 text-lg font-semibold text-white">{listing.title}</h2>

                {listing.location && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                    <MapPin size={14} />
                    {listing.location}
                  </p>
                )}

                <p className="mt-4 border-t border-white/10 pt-4 text-xl font-bold text-[#FF8CA5]">
                  {price}
                  {listing.price !== null && PRICE_UNIT[type] && (
                    <span className="ml-1 text-sm font-medium text-white/50">
                      / {PRICE_UNIT[type]}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}