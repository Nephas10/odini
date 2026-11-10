
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { getListingById } from "../../../action"
import { createClient } from "@/lib/supabase/server"

import StayBookingForm from "./StayBookingForm"
import StayRoomBookingForm from "./StayRoomBookingForm"
import EventBookingForm from "./EventBookingForm"
import ActivityBookingForm from "./ActivityBookingForm"

import {
  createStayBooking,
  createStayRoomBooking,
  createEventBooking,
  createActivityBooking,
} from "./action"

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

export default async function BookingPage({ params }: Props) {
  const { id } = await params

  const result = await getListingById(id)

  if (!result.success || !result.listing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Listing not found
          </h1>

          <Link
            href="/user"
            className="mt-6 inline-flex rounded-xl bg-[#7A1F2B] px-5 py-3 text-sm font-medium text-white"
          >
            Back to Explore
          </Link>
        </div>
      </main>
    )
  }

  const listing = result.listing
  const type = listing.listing_type as keyof typeof PRICE_UNIT

  const supabase = await createClient()

  // Room types are relevant only for stays.
  const { data: roomTypesData, error: roomsError } =
    listing.listing_type === "stay"
      ? await supabase
          .from("stay_room_types")
          .select(`
            id,
            name,
            description,
            price_per_night,
            total_rooms,
            max_guests_per_room
          `)
          .eq("listing_id", listing.id)
          .eq("is_active", true)
          .order("price_per_night", { ascending: true })
      : { data: null, error: null }

  const roomTypes = roomTypesData ?? []
  const hasRoomTypes =
    listing.listing_type === "stay" && roomTypes.length > 0

  // Show the lowest room-category price when configured.
  const price = hasRoomTypes
    ? `From K${roomTypes[0].price_per_night.toLocaleString("en-ZM")}`
    : listing.price !== null
      ? `K${listing.price.toLocaleString("en-ZM")}`
      : "Price on request"

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href={`/user/listings/${listing.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#7A1F2B] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to listing
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          {PAGE_TITLE[type] ?? "Make a booking"}
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          {/* Booking form */}
          <section className="rounded-2xl border border-[#7A1F2B]/15 bg-white p-6 shadow-sm lg:col-span-3">
            {listing.listing_type === "stay" ? (
              roomsError ? (
                <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  Unable to load room categories. Please try again.
                </p>
              ) : hasRoomTypes ? (
                <StayRoomBookingForm
                  listingId={listing.id}
                  roomTypes={roomTypes}
                  action={createStayRoomBooking}
                />
              ) : (
                // Backward compatibility for stays that
                // haven't configured room categories yet.
                <StayBookingForm
                  listingId={listing.id}
                  price={listing.price}
                  maxGuests={
                    listing.stays?.[0]?.max_guests ?? null
                  }
                  action={createStayBooking}
                />
              )
            ) : listing.listing_type === "event" ? (
              <EventBookingForm
                listingId={listing.id}
                price={listing.price}
                availableSlots={
                  listing.events?.[0]?.available_slots ?? null
                }
                action={createEventBooking}
              />
            ) : listing.listing_type === "activity" ? (
              <ActivityBookingForm
                listingId={listing.id}
                price={listing.price}
                maxParticipants={
                  listing.activities?.[0]?.max_participants ??
                  null
                }
                action={createActivityBooking}
              />
            ) : (
              <p className="text-sm text-gray-500">
                Booking form coming soon.
              </p>
            )}
          </section>

          {/* Listing summary */}
          <aside className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-[#7A1F2B]/15 bg-white shadow-sm lg:sticky lg:top-6">
              <div className="h-40 bg-[#F7EDEF]">
                {listing.image_url && (
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#7A1F2B]">
                  {listing.listing_type}
                </span>

                <h2 className="mt-1 text-lg font-semibold text-gray-900">
                  {listing.title}
                </h2>

                {listing.location && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={14} />
                    {listing.location}
                  </p>
                )}

                <p className="mt-4 border-t border-gray-100 pt-4 text-xl font-bold text-[#7A1F2B]">
                  {price}

                  {PRICE_UNIT[type] && (
                    <span className="ml-1 text-sm font-medium text-gray-500">
                      / {PRICE_UNIT[type]}
                    </span>
                  )}
                </p>

                {hasRoomTypes && (
                  <p className="mt-2 text-xs text-gray-500">
                    Final price depends on your selected
                    room category, quantity, and dates.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
