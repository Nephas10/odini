import Link from "next/link"
import { CalendarCheck, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const PRICE_UNIT: Record<string, string> = {
  stay: "/ night",
  event: "/ ticket",
  activity: "/ person",
}

// The layout has already checked this is a logged-in host.
export default async function HostDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: listings, error }, { data: pending }] = await Promise.all([
    supabase.from("profiles").select("business_name, firstname").eq("id", user!.id).maybeSingle(),
    supabase
      .from("listings")
      .select("id, title, listing_type, price, is_active, image_url, created_at")
      .eq("host_id", user!.id)
      .order("created_at", { ascending: false }),
    // Pending bookings on this host's listings (needs the host bookings policy from the next step)
    supabase
      .from("bookings")
      .select("id, listings!inner(host_id)")
      .eq("listings.host_id", user!.id)
      .eq("status", "pending"),
  ])

  const totalListings = listings?.length ?? 0
  const activeListings = listings?.filter((l) => l.is_active).length ?? 0
  const draftListings = totalListings - activeListings
  const pendingBookings = pending?.length ?? 0

  const name = profile?.business_name || profile?.firstname || "there"

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Welcome band */}
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#F7EDEF]/80">
              Host dashboard
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white">Welcome back, {name}</h1>
            <p className="mt-2 text-[#F7EDEF]/90">Manage your listings and bookings from here.</p>
          </div>
          <Link
            href="/host/listings/new"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#D4A64A] px-5 py-3 text-sm font-semibold text-[#3D0F15] transition hover:bg-[#E2B85E]"
          >
            <Plus size={16} />
            Create listing
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        {/* Stats */}
        <div className="-mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active listings", value: activeListings },
            { label: "Drafts", value: draftListings },
            { label: "Booking requests waiting", value: pendingBookings },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-md">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-[#7A1F2B]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Bookings call-out when something is waiting */}
        {pendingBookings > 0 && (
          <Link
            href="/host/bookings"
            className="mt-6 flex items-center gap-4 rounded-2xl border border-[#D4A64A]/50 bg-[#D4A64A]/10 p-5 transition hover:bg-[#D4A64A]/20"
          >
            <CalendarCheck size={24} className="shrink-0 text-[#7A1F2B]" />
            <p className="flex-1 text-sm text-gray-800">
              <span className="font-semibold">
                {pendingBookings} booking {pendingBookings === 1 ? "request is" : "requests are"} waiting
              </span>{" "}
              for you to confirm.
            </p>
            <span className="text-sm font-semibold text-[#7A1F2B]">Review →</span>
          </Link>
        )}

        {/* Listings */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your listings</h2>
              <p className="mt-1 text-sm text-gray-500">Manage the experiences you offer.</p>
            </div>
            {totalListings > 0 && (
              <Link href="/host/listings" className="text-sm font-semibold text-[#7A1F2B] hover:underline">
                View all
              </Link>
            )}
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl bg-white p-6 text-sm text-red-600">
              Unable to load your listings.
            </div>
          ) : totalListings > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listings!.slice(0, 6).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/host/listings/${listing.id}/edit`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-32 bg-[#F7EDEF]">
                    {listing.image_url ? (
                      <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#7A1F2B]/60">
                        No photo yet
                      </div>
                    )}
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        listing.is_active ? "bg-green-100 text-green-700" : "bg-white/90 text-gray-600"
                      }`}
                    >
                      {listing.is_active ? "Active" : "Draft"}
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#7A1F2B]">
                      {listing.listing_type}
                    </span>
                    <h3 className="mt-1 truncate font-semibold text-gray-900 group-hover:text-[#7A1F2B]">
                      {listing.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {listing.price != null ? `K${listing.price.toLocaleString("en-ZM")}` : "Price on request"}
                      {listing.price != null && PRICE_UNIT[listing.listing_type] && (
                        <span className="ml-1 text-xs">{PRICE_UNIT[listing.listing_type]}</span>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#7A1F2B]/30 bg-white p-10 text-center">
              <h3 className="font-semibold text-gray-900">No listings yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create your first listing to start getting bookings.
              </p>
              <Link
                href="/host/listings/new"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5E1721]"
              >
                <Plus size={16} />
                Create your first listing
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}