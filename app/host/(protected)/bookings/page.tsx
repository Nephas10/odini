import Link from "next/link"
import { CalendarCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import HostBookingCard, { type HostBooking } from "./HostBookingCard"

// Supabase types the joined listing as a list, but each booking has one listing
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

const TABS = [
  { value: "pending", label: "Waiting" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
] as const

type Tab = (typeof TABS)[number]["value"]

const EMPTY_TEXT: Record<Tab, string> = {
  pending: "No booking requests waiting. New ones will show up here.",
  confirmed: "No confirmed bookings yet.",
  cancelled: "No cancelled bookings.",
  all: "No bookings on your listings yet.",
}

type Props = {
  searchParams: Promise<{ status?: string }>
}

// Page only: loads this host's bookings and shows a card for each.
// The layout has already checked this is a logged-in host.
export default async function HostBookingsPage({ searchParams }: Props) {
  const { status } = await searchParams
  const tab: Tab = TABS.some((t) => t.value === status) ? (status as Tab) : "pending"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Bookings on listings owned by this host (allowed by the host bookings policy)
  const { data: rows, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_reference,
      status,
      payment_status,
      payment_method,
      check_in,
      check_out,
      nights,
      booking_date,
      guests,
      quantity,
      customer_name,
      customer_phone,
      created_at,
      listings!inner ( title, listing_type, price, host_id )
    `)
    .eq("listings.host_id", user!.id)
    .order("created_at", { ascending: false })

  const bookings: HostBooking[] = (rows ?? []).map(({ listings, ...booking }) => {
    const listing = one(listings)
    return {
      ...booking,
      listing: listing
        ? { title: listing.title, listing_type: listing.listing_type, price: listing.price }
        : null,
    }
  })

  const counts: Record<Tab, number> = {
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    all: bookings.length,
  }

  const shown = tab === "all" ? bookings : bookings.filter((b) => b.status === tab)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header band */}
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F7EDEF]/80">Host</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Bookings</h1>
          <p className="mt-2 text-[#F7EDEF]/90">
            Confirm requests, mark them paid, and message guests on WhatsApp.
          </p>

          {/* Tabs */}
          <nav className="mt-6 flex gap-1 overflow-x-auto" aria-label="Filter bookings">
            {TABS.map((t) => {
              const active = t.value === tab
              return (
                <Link
                  key={t.value}
                  href={`/host/bookings?status=${t.value}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition ${
                    active ? "bg-gray-50 text-[#7A1F2B]" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active
                        ? "bg-[#7A1F2B] text-white"
                        : t.value === "pending" && counts.pending > 0
                          ? "bg-[#D4A64A] text-[#3D0F15]"
                          : "bg-white/15 text-white"
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

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {error ? (
          <div className="rounded-2xl bg-white p-6 text-sm text-red-600 shadow-sm">
            Unable to load your bookings. Please refresh the page.
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#7A1F2B]/30 bg-white p-10 text-center">
            <CalendarCheck size={36} className="mx-auto text-[#7A1F2B]/50" />
            <p className="mt-3 text-sm text-gray-600">{EMPTY_TEXT[tab]}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shown.map((booking) => (
              <HostBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}