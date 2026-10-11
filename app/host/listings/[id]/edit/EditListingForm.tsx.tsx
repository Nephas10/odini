"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateListingAction } from "./action"
import EventFields from "./EventFields"
import StayFields from "./StayFields"
import ActivityFields from "./ActivityFields"

type Listing = {
  id: string
  listing_type: string
  title: string
  description: string | null
  price: number | null
  location: string | null
  is_active: boolean
  image_url: string | null

  stays: {
    listing_id: string
    max_guests: number
  }[]

  events: {
    listing_id: string
    event_type: string | null
    event_time: string
    end_time: string | null
    capacity: number
    available_slots: number
  }[]

  activities: {
    listing_id: string
    activity_category: string | null
    duration_minutes: number
    max_participants: number
    meeting_point: string | null
  }[]
}

type Props = {
  listing: Listing
}

export default function EditListingForm({ listing }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState(listing.title)
  
  const [description, setDescription] = useState(
    listing.description ?? ""
  )
  const [price, setPrice] = useState(
    listing.price?.toString() ?? ""
  )
  const [location, setLocation] = useState(
    listing.location ?? ""
  )

  const [publish, setPublish] = useState(
    listing.is_active
  )
  const stay = listing.stays?.[0]

  const [maxGuests, setMaxGuests] = useState(
   stay?.max_guests?.toString() ?? ""
  )

  const activity = listing.activities?.[0]

  const [activityCategory, setActivityCategory] = useState(
  activity?.activity_category ?? ""
   )

  const [durationMinutes, setDurationMinutes] = useState(
  activity?.duration_minutes?.toString() ?? ""
  )

  const [maxParticipants, setMaxParticipants] = useState(
  activity?.max_participants?.toString() ?? ""
  )

  const [meetingPoint, setMeetingPoint] = useState(
  activity?.meeting_point ?? ""
  )

  const event = listing.events?.[0]
  const [eventType, setEventType] = useState(
  event?.event_type ?? ""
  )

 const [eventTime, setEventTime] = useState(
   event?.event_time
     ? event.event_time.slice(0, 16)
     : ""
 )

const [endTime, setEndTime] = useState(
  event?.end_time
    ? event.end_time.slice(0, 16)
    : ""
)

const [capacity, setCapacity] = useState(
  event?.capacity?.toString() ?? ""
)

const [availableSlots, setAvailableSlots] = useState(
  event?.available_slots?.toString() ?? ""
)

  async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault()

  setError("")
  setLoading(true)

  const result = await updateListingAction({
    id: listing.id,

    listingType:
      listing.listing_type as "stay" | "event" | "activity",

    title,
    description,
    price: Number(price),
    location,
    publish,

    maxGuests:
    
    listing.listing_type === "stay"
      ? Number(maxGuests)
      : undefined,

    activityCategory:
    listing.listing_type === "activity"
      ? activityCategory
      : undefined,

  durationMinutes:
    listing.listing_type === "activity"
      ? Number(durationMinutes)
      : undefined,

  maxParticipants:
    listing.listing_type === "activity"
      ? Number(maxParticipants)
      : undefined,

  meetingPoint:
    listing.listing_type === "activity"
      ? meetingPoint
      : undefined,

    eventType:
    listing.listing_type === "event"
        ? eventType
        : undefined,

    eventTime:
    listing.listing_type === "event"
    ? eventTime
    : undefined,

    endTime:
    listing.listing_type === "event"
        ? endTime
        : undefined,

    capacity:
    listing.listing_type === "event"
        ? Number(capacity)
        : undefined,

    availableSlots:
    listing.listing_type === "event"
        ? Number(availableSlots)
        : undefined,
  })

  if (!result.success) {
    setError(result.error?? "Something went wrong.")
    setLoading(false)
    return
  }

  router.push("/host")
}

  return (
    <form 
     onSubmit={handleSubmit}
     className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8"
    >
      <div className="space-y-6">

        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* Price */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Price
          </label>

          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Location
          </label>

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>
        {listing.listing_type === "stay" && (
          <StayFields
             maxGuests={maxGuests}
             setMaxGuests={setMaxGuests}
            />
        )}
        {listing.listing_type === "event" && (
        <EventFields
            eventType={eventType}
            setEventType={setEventType}
            eventTime={eventTime}
            setEventTime={setEventTime}
            endTime={endTime}
            setEndTime={setEndTime}
            capacity={capacity}
            setCapacity={setCapacity}
            availableSlots={availableSlots}
            setAvailableSlots={setAvailableSlots}
        />
        )}
        {listing.listing_type === "activity" && (
        <ActivityFields
            activityCategory={activityCategory}
            setActivityCategory={setActivityCategory}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            maxParticipants={maxParticipants}
            setMaxParticipants={setMaxParticipants}
            meetingPoint={meetingPoint}
            setMeetingPoint={setMeetingPoint}
        />
        )}
        {/* Publish */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="h-4 w-4"
          />

          <label className="text-sm font-medium text-gray-700">
            Publish this listing
          </label>
        </div>
        {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
            </div>
        )}
        {/* Button */}
        <button
         type="submit"
         disabled={loading}
         className="rounded-full bg-[#e8365d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d02d50] disabled:cursor-not-allowed disabled:opacity-50"
        >
         {loading
            ? "Saving..."
            : publish
            ? "Publish Listing"
            : "Save Draft"}
        </button>

      </div>
    </form>
  )
}