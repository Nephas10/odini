
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BedDouble, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import ListingForm from "../../_form/ListingForm"
import { updateListing } from "../../_form/action"
import type { ListingType } from "../../_form/fields"

// Supabase types joined rows as a list,
// but each listing has one details row.
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

type Props = {
  params: Promise<{ id: string }>
}

// Loads the listing and its details,
// then shows the shared form filled in.
export default async function EditListingPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected host layout already handles authentication.
  if (!user) notFound()

  const { data: listing } = await supabase
    .from("listings")
    .select("*, stays(*), events(*), activities(*)")
    .eq("id", id)
    .eq("host_id", user.id)
    .maybeSingle()

  // Not found or listing belongs to another host.
  if (!listing) notFound()

  const type = listing.listing_type as ListingType

  const { stays, events, activities, ...base } = listing

  const details =
    one(
      type === "stay"
        ? stays
        : type === "event"
        ? events
        : activities
    ) ?? {}

  // Tickets already booked.
  const ticketsSold =
    type === "event" && details.capacity != null
      ? Math.max(
          0,
          details.capacity -
            (details.available_slots ?? details.capacity)
        )
      : 0

  // Older listings may only have image_url.
  const photos: string[] =
    base.photos && base.photos.length > 0
      ? base.photos
      : base.image_url
      ? [base.image_url]
      : []

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

          {/* Navigation and actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">

            <Link
              href="/host/listings"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#F7EDEF]/80 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to listings
            </Link>

            <div className="flex flex-wrap items-center gap-2">

              {/* Manage Rooms: available for all stays */}
              {type === "stay" && (
                <Link
                  href={`/host/listings/${id}/rooms`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#7A1F2B] transition hover:bg-[#F7EDEF]"
                >
                  <BedDouble size={15} />
                  Manage Rooms
                </Link>
              )}

              {/* View as guest: only for published listings */}
              {base.is_active && (
                <Link
                  href={`/user/listings/${id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  <Eye size={14} />
                  View as guest
                </Link>
              )}

            </div>
          </div>

          {/* Listing information */}
          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-[#F7EDEF]/80">
            Edit {type}
          </p>

          <h1 className="mt-1 line-clamp-2 text-3xl font-bold text-white">
            {base.title}
          </h1>

          <p className="mt-2 text-sm text-[#F7EDEF]/90">
            {base.is_active
              ? 'Live: guests can see this listing. "Save as draft" hides it.'
              : 'Draft: guests cannot see this yet. "Publish listing" makes it live.'}
          </p>
        </div>
      </section>

      {/* Existing listing editor */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ListingForm
          userId={user.id}
          action={updateListing.bind(null, id)}
          lockedType={type}
          ticketsSold={ticketsSold}
          defaults={{
            ...base,
            photos,
            details,
          }}
        />
      </div>
    </main>
  )
}
