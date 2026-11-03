
import { Clock, Flag, MapPin, Tag, Users } from "lucide-react"
import BookNowButton from "./BookNowButton"
import ListingPhotoGallery from "@/components/listings/ListingPhotoGallery"

type ActivityListing = {
  id: string
  title: string
  description: string | null
  price: number | null
  location: string | null
  image_url: string | null
  photos?: string[] | null
  activities?: {
    activity_category: string | null
    duration_minutes: number | null
    max_participants: number | null
    meeting_point: string | null
  }[] | null
}

type Props = {
  listing: ActivityListing
}

// Turns 90 into "1 hr 30 min", 45 into "45 min", 120 into "2 hrs"
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins} min`

  const hourText = `${hours} ${hours === 1 ? "hr" : "hrs"}`

  return mins === 0 ? hourText : `${hourText} ${mins} min`
}

// Shows an activity listing. Takes data in, renders it. No fetching here.
export default function ActivityView({ listing }: Props) {
  const activity = listing.activities?.[0]

  const price =
    listing.price !== null
      ? `K${listing.price.toLocaleString("en-ZM")}`
      : "Price on request"

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      {/* Left: details */}
      <div className="space-y-8 lg:col-span-2">
        {/* Activity photo gallery */}
        <ListingPhotoGallery
          title={listing.title}
          coverImage={listing.image_url}
          photos={listing.photos}
          badge="Activity"
        />

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
          {/* Duration */}
          {activity?.duration_minutes != null && (
            <div className="flex items-center gap-2 rounded-xl bg-[#F7EDEF] px-4 py-3 text-sm font-medium text-[#7A1F2B]">
              <Clock size={18} />
              {formatDuration(activity.duration_minutes)}
            </div>
          )}

          {/* Maximum participants */}
          {activity?.max_participants != null && (
            <div className="flex items-center gap-2 rounded-xl bg-[#F7EDEF] px-4 py-3 text-sm font-medium text-[#7A1F2B]">
              <Users size={18} />
              Up to {activity.max_participants}{" "}
              {activity.max_participants === 1
                ? "person"
                : "people"}
            </div>
          )}

          {/* Activity category */}
          {activity?.activity_category && (
            <div className="flex items-center gap-2 rounded-xl bg-[#F7EDEF] px-4 py-3 text-sm font-medium capitalize text-[#7A1F2B]">
              <Tag size={18} />
              {activity.activity_category}
            </div>
          )}
        </div>

        {/* Meeting point */}
        {activity?.meeting_point && (
          <div className="flex items-start gap-3 rounded-xl border border-[#7A1F2B]/15 p-4">
            <Flag
              size={20}
              className="mt-0.5 shrink-0 text-[#7A1F2B]"
            />

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Meeting point
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {activity.meeting_point}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              About this activity
            </h2>

            <p className="mt-2 whitespace-pre-line leading-7 text-gray-600">
              {listing.description}
            </p>
          </div>
        )}
      </div>

      {/* Right: Price and booking */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-[#7A1F2B]/15 bg-white p-6 shadow-sm">
          {/* Activity price */}
          <p className="text-2xl font-bold text-[#7A1F2B]">
            {price}

            {listing.price !== null && (
              <span className="ml-1 text-sm font-medium text-gray-500">
                / person
              </span>
            )}
          </p>

          {/* Booking explanation */}
          <p className="mt-2 text-sm text-gray-500">
            Booking is confirmed by the host on WhatsApp.
          </p>

          {/* Booking action */}
          <BookNowButton listingId={listing.id} />
        </div>
      </aside>
    </div>
  )
}
