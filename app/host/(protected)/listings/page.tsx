import Link from "next/link"
import { CheckCircle2, Eye, MapPin, Pencil, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import ListingStatusToggle from "./ListingStatusToggle"

const PRICE_UNIT: Record<string, string> = {
  stay: "/ night",
  event: "/ ticket",
  activity: "/ person",
}

const TABS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
] as const

type Tab = (typeof TABS)[number]["value"]

type Props = {
  searchParams: Promise<{ show?: string; saved?: string }>
}

// Page only: loads the host's listings and shows a card for each.
// The (protected) layout has already checked this is a logged-in host.
export default async function HostListingsPage({ searchParams }: Props) {
  const { show, saved } = await searchParams
  const tab: Tab = TABS.some((t) => t.value === show) ? (show as Tab) : "all"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, title, listing_type, price, location, is_active, image_url, photos, created_at")
    .eq("host_id", user!.id)
    .order("created_at", { ascending: false })

  const all = listings ?? []
  const counts: Record<Tab, number> = {
    all: all.length,
    published: all.filter((l) => l.is_active).length,
    draft: all.filter((l) => !l.is_active).length,
  }
  const shown =
    tab === "published" ? all.filter((l) => l.is_active) : tab === "draft" ? all.filter((l) => !l.is_active) : all

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header band */}
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#F7EDEF]/80">Host</p>
              <h1 className="mt-1 text-3xl font-bold text-white">Your listings</h1>
              <p className="mt-2 text-[#F7EDEF]/90">Publish, hide and edit what guests can book.</p>
            </div>
            <Link
              href="/host/listings/new"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#D4A64A] px-5 py-3 text-sm font-semibold text-[#3D0F15] transition hover:bg-[#E2B85E]"
            >
              <Plus size={16} />
              Create listing
            </Link>
          </div>

          {/* Tabs */}
          <nav className="mt-6 flex gap-1 overflow-x-auto" aria-label="Filter listings">
            {TABS.map((t) => {
              const active = t.value === tab
              return (
                <Link
                  key={t.value}
                  href={`/host/listings?show=${t.value}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition ${
                    active ? "bg-gray-50 text-[#7A1F2B]" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active ? "bg-[#7A1F2B] text-white" : "bg-white/15 text-white"
                    }`}
                  >
                    {counts[t.value]}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* After creating a listing */}
        {(saved === "published" || saved === "draft" || saved === "updated") && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
            <CheckCircle2 size={20} className="shrink-0" />
            {saved === "published"
              ? "Your listing is published. Guests can find and book it now."
              : saved === "updated"
                ? "Your changes are saved."
                : "Saved as a draft. Guests can't see it until you publish it."}
          </div>
        )}

        {error ? (
          <div className="rounded-2xl bg-white p-6 text-sm text-red-600 shadow-sm">
            Unable to load your listings. Please refresh the page.
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#7A1F2B]/30 bg-white p-10 text-center">
            <p className="font-semibold text-gray-900">
              {tab === "all" ? "No listings yet" : tab === "published" ? "Nothing published yet" : "No drafts"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {tab === "all"
                ? "Create your first listing to start getting bookings."
                : "Switch tabs to see your other listings."}
            </p>
            {tab === "all" && (
              <Link
                href="/host/listings/new"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5E1721]"
              >
                <Plus size={16} />
                Create your first listing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((listing) => {
              const photoCount = listing.photos?.length ?? (listing.image_url ? 1 : 0)
              return (
                <article key={listing.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                  {/* Photo */}
                  <div className="relative h-44 bg-[#F7EDEF]">
                    {listing.image_url ? (
                      <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#7A1F2B]/60">
                        No photo yet
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-[#7A1F2B] px-2.5 py-1 text-xs font-semibold capitalize text-white">
                      {listing.listing_type}
                    </span>
                    {photoCount > 1 && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                        {photoCount} photos
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="line-clamp-2 font-semibold text-gray-900">{listing.title}</h2>
                    {listing.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin size={14} className="text-[#7A1F2B]" />
                        {listing.location}
                      </p>
                    )}
                    <p className="mt-2 font-bold text-[#7A1F2B]">
                      {listing.price != null ? `K${listing.price.toLocaleString("en-ZM")}` : "Price on request"}
                      {listing.price != null && PRICE_UNIT[listing.listing_type] && (
                        <span className="ml-1 text-xs font-medium text-gray-500">
                          {PRICE_UNIT[listing.listing_type]}
                        </span>
                      )}
                    </p>

                    {/* Actions */}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <ListingStatusToggle listingId={listing.id} isActive={listing.is_active} />
                      <div className="flex gap-2">
                        {listing.is_active && (
                          <Link
                            href={`/user/listings/${listing.id}`}
                            aria-label="View as guest"
                            title="View as guest"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#7A1F2B] hover:text-[#7A1F2B]"
                          >
                            <Eye size={16} />
                          </Link>
                        )}
                        <Link
                          href={`/host/listings/${listing.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#7A1F2B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
                        >
                          <Pencil size={14} />
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}