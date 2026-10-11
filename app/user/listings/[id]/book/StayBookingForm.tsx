"use client"

import { useActionState, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import WhatsAppButton from "./WhatsAppButton"

// What the server sends back after a booking attempt
export type BookingState = {
  error?: string
  reference?: string
  whatsappUrl?: string
}

type Props = {
  listingId: string
  price: number | null
  maxGuests: number | null
  // The function that saves the booking. Passed in from the page,
  // so this form only collects input and never talks to the database.
  action: (prevState: BookingState, formData: FormData) => Promise<BookingState>
}

// Today's date as YYYY-MM-DD in the user's own time zone
function todayString() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

export default function StayBookingForm({ listingId, price, maxGuests, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, {})

  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)

  const today = todayString()
  const nights = nightsBetween(checkIn, checkOut)
  const total = price !== null ? price * nights : null

  // After a successful booking, show the confirmation instead of the form
  if (state.reference) {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 size={48} className="mx-auto text-[#7A1F2B]" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Booking request sent</h2>
        <p className="mt-2 text-sm text-gray-500">Your booking reference is</p>
        <p className="mt-1 text-2xl font-bold tracking-wider text-[#7A1F2B]">
          {state.reference}
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm text-gray-500">
          The host will confirm your booking on WhatsApp. Keep this reference handy.
        </p>
        <WhatsAppButton url={state.whatsappUrl} />
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="listing_id" value={listingId} />

      {/* Dates */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Your dates</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Check-in</span>
            <input
              type="date"
              name="check_in"
              required
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value)
                // Clear check-out if it's no longer after check-in
                if (checkOut && e.target.value >= checkOut) setCheckOut("")
              }}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#7A1F2B] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/20 text-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Check-out</span>
            <input
              type="date"
              name="check_out"
              required
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#7A1F2B] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/20 text-gray-900"
            />
          </label>
        </div>
      </div>

      {/* Guests */}
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Guests</span>
        <input
          type="number"
          name="guests"
          required
          min={1}
          max={maxGuests ?? undefined}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#7A1F2B] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/20 text-gray-900"
        />
        {maxGuests !== null && (
          <span className="mt-1 block text-xs text-gray-500">Maximum {maxGuests} guests</span>
        )}
      </label>

      {/* Contact */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Your details</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Full name</span>
            <input
              type="text"
              name="customer_name"
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#7A1F2B] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/20 text-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">WhatsApp number</span>
            <input
              type="tel"
              name="customer_phone"
              required
              placeholder="+260 97 123 4567"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#7A1F2B] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/20 text-gray-900"
            />
          </label>
        </div>
      </div>

      {/* Payment preference */}
      <label className="block">
        <span className="text-sm font-medium text-gray-700">How would you like to pay?</span>
        <select
          name="payment_method"
          defaultValue="mobile_money"
          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-[#7A1F2B] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/20 text-gray-900"
        >
          <option value="mobile_money">Mobile money</option>
          <option value="card">Card</option>
        </select>
      </label>

      {/* Total */}
      <div className="rounded-xl bg-[#F7EDEF] p-4">
        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>
            {price !== null ? `K${price.toLocaleString("en-ZM")}` : "—"} × {nights}{" "}
            {nights === 1 ? "night" : "nights"}
          </span>
          <span className="text-lg font-bold text-[#7A1F2B]">
            {total !== null ? `K${total.toLocaleString("en-ZM")}` : "Price on request"}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">You won't be charged now.</p>
      </div>

      {/* Error from the server */}
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || nights === 0}
        className="w-full rounded-xl bg-[#7A1F2B] px-5 py-3 font-medium text-white transition hover:bg-[#5E1721] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Sending request..." : "Request booking"}
      </button>
    </form>
  )
}