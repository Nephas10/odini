"use client"

import { useActionState, useState } from "react"
import { CheckCircle2, Minus, Plus } from "lucide-react"
import type { BookingState } from "./action"
import WhatsAppButton from "./WhatsAppButton"

type Props = {
  listingId: string
  price: number | null
  availableSlots: number | null
  // The function that saves the booking. Passed in from the page,
  // so this form only collects input and never talks to the database.
  action: (prevState: BookingState, formData: FormData) => Promise<BookingState>
}

// Most tickets one person can request at once
const MAX_PER_BOOKING = 10

export default function EventBookingForm({ listingId, price, availableSlots, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, {})
  const [tickets, setTickets] = useState(1)

  const isSoldOut = availableSlots === 0
  const maxTickets =
    availableSlots !== null ? Math.min(availableSlots, MAX_PER_BOOKING) : MAX_PER_BOOKING
  const total = price !== null ? price * tickets : null

  // After a successful booking, show the confirmation instead of the form
  if (state.reference) {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 size={48} className="mx-auto text-[#7A1F2B]" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Tickets requested</h2>
        <p className="mt-2 text-sm text-gray-500">Your booking reference is</p>
        <p className="mt-1 text-2xl font-bold tracking-wider text-[#7A1F2B]">
          {state.reference}
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm text-gray-500">
          The host will confirm your tickets on WhatsApp. Keep this reference handy.
        </p>
      </div>
    )
  }

  if (isSoldOut) {
    return (
      <div className="py-6 text-center">
        <h2 className="text-xl font-bold text-gray-900">This event is sold out</h2>
        <p className="mt-2 text-sm text-gray-500">There are no tickets left to book.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="quantity" value={tickets} />

      {/* Tickets */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Tickets</h2>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTickets((t) => Math.max(1, t - 1))}
            disabled={tickets <= 1}
            aria-label="Remove a ticket"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7A1F2B]/30 text-[#7A1F2B] transition hover:bg-[#F7EDEF] disabled:opacity-40"
          >
            <Minus size={18} />
          </button>

          <span className="w-10 text-center text-2xl font-bold text-gray-900">{tickets}</span>

          <button
            type="button"
            onClick={() => setTickets((t) => Math.min(maxTickets, t + 1))}
            disabled={tickets >= maxTickets}
            aria-label="Add a ticket"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7A1F2B]/30 text-[#7A1F2B] transition hover:bg-[#F7EDEF] disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        </div>
        {availableSlots !== null && (
          <p className="mt-2 text-xs text-gray-500">
            {availableSlots} {availableSlots === 1 ? "spot" : "spots"} left
          </p>
        )}
      </div>

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
            {price !== null ? `K${price.toLocaleString("en-ZM")}` : "—"} × {tickets}{" "}
            {tickets === 1 ? "ticket" : "tickets"}
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
        disabled={isPending}
        className="w-full rounded-xl bg-[#7A1F2B] px-5 py-3 font-medium text-white transition hover:bg-[#5E1721] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Sending request..." : "Request tickets"}
      </button>
    </form>
  )
}