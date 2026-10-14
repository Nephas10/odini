import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import ListingForm from "../../_form/ListingForm"
import { updateListing } from "../../_form/action"
import type { ListingType } from "../../_form/fields"

// Supabase types joined rows as a list, but each listing has one details row
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

type Props = {
  params: Promise<{ id: string }>
}

// Page only: loads the listing and its details, then shows the shared form filled in.
// The (protected) layout has already checked this is a logged-in host.
export default async function EditListingPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from("listings")
    .select("*, stays(*), events(*), activities(*)")
    .eq("id", id)
    .eq("host_id", user!.id)
    .maybeSingle()

  // Not found, or not this host's listing
  if (!listing) notFound()

  const type = listing.listing_type as ListingType
  const { stays, events, activities, ...base } = listing
  const details = one(type === "stay" ? stays : type === "event" ? events : activities) ?? {}

  // Tickets already booked = capacity minus what's still available
  const ticketsSold =
    type === "event" && details.capacity != null
      ? Math.max(0, details.capacity - (details.available_slots ?? details.capacity))
      : 0

  // Older listings may only have image_url
  const photos: string[] =
    base.photos && base.photos.length > 0 ? base.photos : base.image_url ? [base.image_url] : []

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/host/listings"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#F7EDEF]/80 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to listings
            </Link>
            {base.is_active && (
              <Link
                href={`/user/listings/${id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                <Eye size={14} />
                View as guest
              </Link>
            )}
          </div>

          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-[#F7EDEF]/80">
            Edit {type}
          </p>
          <h1 className="mt-1 line-clamp-2 text-3xl font-bold text-white">{base.title}</h1>
          <p className="mt-2 text-sm text-[#F7EDEF]/90">
            {base.is_active
              ? "Live: guests can see this listing. \"Save as draft\" hides it."
              : "Draft: guests can't see this yet. \"Publish listing\" makes it live."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ListingForm
          userId={user!.id}
          action={updateListing.bind(null, id)}
          lockedType={type}
          ticketsSold={ticketsSold}
          defaults={{ ...base, photos, details }}
        />
      </div>
    </main>
  )
}