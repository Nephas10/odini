import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import EditListingForm from "./EditListingForm.tsx"
type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      id,
      host_id,
      listing_type,
      title,
      description,
      price,
      location,
      is_active,
      image_url,
      stays (
        listing_id,
        max_guests
      ),
      events (
        listing_id,
        event_type,
        event_time,
        end_time,
        capacity,
        available_slots
      ),
      activities (
        listing_id,
        activity_category,
        duration_minutes,
        max_participants,
        meeting_point
      )
    `)
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  if (error || !listing) {
    console.error("Edit listing fetch error:", error)
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium text-[#e8365d]">
          Host
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Edit Listing
        </h1>

        <p className="mt-2 text-gray-500">
          Update the details of your listing.
        </p>

        <EditListingForm
        listing={{
          id: listing.id,
          listing_type: listing.listing_type,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          location: listing.location,
          is_active: listing.is_active,
          image_url: listing.image_url,

           stays: listing.stays ?? [],
           events: listing.events ?? [],
           activities: listing.activities ?? [],
        }}
      />
      </div>
    </main>
  )
}