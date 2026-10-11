"use client"

import { useState } from "react"
import StayFields from "./StayFields"
import EventFields from "./EventFields"
import ActivityFields from "./ActivityFields"
import {useRouter} from "next/navigation"
import {createListingAction} from "./action"

export default function ListingForm() {
  const router = useRouter()
  const [listingType, setListingType] = useState("stay")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")

  const [maxGuests, setMaxGuests] = useState("")

  const [eventType, setEventType] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [capacity, setCapacity] = useState("")
  const [availableSlots, setAvailableSlots] = useState("")

  const [activityCategory, setActivityCategory] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [maxParticipants, setMaxParticipants] = useState("")
  const [meetingPoint, setMeetingPoint] = useState("")

  const [publish, setPublish] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault()

  setError("")
  setLoading(true)

  const result = await createListingAction({
    listingType: listingType as "stay" | "event" | "activity",

    title,
    description,
    price: Number(price),
    location,

    publish,

    maxGuests:
      listingType === "stay"
        ? Number(maxGuests)
        : undefined,

    eventType:
      listingType === "event"
        ? eventType
        : undefined,

    eventTime:
      listingType === "event"
        ? eventTime
        : undefined,

    endTime:
      listingType === "event"
        ? endTime
        : undefined,

    capacity:
      listingType === "event"
        ? Number(capacity)
        : undefined,

    availableSlots:
      listingType === "event"
        ? Number(availableSlots)
        : undefined,

    activityCategory:
      listingType === "activity"
        ? activityCategory
        : undefined,

    durationMinutes:
      listingType === "activity"
        ? Number(durationMinutes)
        : undefined,

    maxParticipants:
      listingType === "activity"
        ? Number(maxParticipants)
        : undefined,

    meetingPoint:
      listingType === "activity"
        ? meetingPoint
        : undefined,
  })

  if (!result.success) {
    setError("")
    setLoading(false)
    return
  }

  router.push(`/host/listings/${result.listingId}/edit`)
}
  
  return (
    <form
     onSubmit={handleSubmit}
     className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
    >

      {/* Listing Type */}
      <div>
        <label
          htmlFor="listingType"
          className="text-sm font-semibold text-gray-900"
        >
          Listing Type
        </label>

        <select
          id="listingType"
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
        >
          <option value="stay">Stay</option>
          <option value="event">Event</option>
          <option value="activity">Activity</option>
        </select>
      </div>

      {/* Basic Information */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900">
          Basic Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Tell users about what you are offering.
        </p>

        <div className="mt-5 space-y-5">

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="text-sm font-semibold text-gray-900"
            >
              Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Luxury Riverside Apartment"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="text-sm font-semibold text-gray-900"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your listing..."
              rows={5}
              className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
            />
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="text-sm font-semibold text-gray-900"
            >
              Price
            </label>

            <input
              id="price"
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 100"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="text-sm font-semibold text-gray-900"
            >
              Location
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lusaka"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
            />
          </div>

        </div>
      </div>

      {/* Stay */}
      {listingType === "stay" && (
        <StayFields
          maxGuests={maxGuests}
          setMaxGuests={setMaxGuests}
        />
      )}

      {/* Event */}
      {listingType === "event" && (
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

      {/* Activity */}
      {listingType === "activity" && (
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
      {error && (
        <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div> 
      )}
      {/* Publish */}
      <div className="mt-10 border-t border-gray-100 pt-6">

        <div className="flex items-start gap-3">
          <input
            id="publish"
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#e8365d]"
          />

          <div>
            <label
              htmlFor="publish"
              className="cursor-pointer text-sm font-semibold text-gray-900"
            >
              Publish Listing
            </label>

            <p className="mt-1 text-sm text-gray-500">
              Publish this listing immediately so users can discover it.
              Leave unchecked to save it as a draft.
            </p>
          </div>
        </div>

      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-end">
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