"use client"

import { useActionState, useState } from "react"
import { CheckCircle2, Minus, Plus } from "lucide-react"
import type { BookingState } from "./action"
import WhatsAppButton from "./WhatsAppButton"

type Props = {
  listingId: string
  price: number | null
  maxParticipants: number | null
  // The function that saves the booking. Passed in from the page,
  // so this form only collects input and never talks to the database.
  action: (prevState: BookingState, formData: FormData) => Promise<BookingState>
}

// Used when the host hasn't set a group limit
const DEFAULT_MAX_PEOPLE = 20

// Today's date as YYYY-MM-DD in the user's own time zone
function todayString() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export default function ActivityBookingForm({ listingId, price, maxParticipants, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, {})
  const [date, setDate] = useState("")
  const [people, setPeople] = useState(1)

  const maxPeople = maxParticipants ?? DEFAULT_MAX_PEOPLE
  const total = price !== null ? price * people : null

  // After a successful booking, show the confirmation instead of the form
  if (state.reference) {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 size={48} className="mx-auto text-[#FF8CA5]" />
        <h2 className="mt-4 text-xl font-bold text-white">Booking request sent</h2>
        <p className="mt-2 text-sm text-white/50">Your booking reference is</p>
        <p className="mt-1 text-2xl font-bold tracking-wider text-[#FF8CA5]">
          {state.reference}
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm text-white/50">
          The host will confirm your activity on WhatsApp. Keep this reference handy.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="guests" value={people} />

      {/* Date */}
      <label className="block">
        <span className="text-lg font-semibold text-white">Choose a date</span>
        <input
          type="date"
          name="activity_date"
          required
          min={todayString()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-3 w-full rounded-xl border border-white/15 bg-[#242024] px-4 py-3 text-white [color-scheme:dark] placeholder:text-white/30 focus:border-[#e8365d] focus:outline-none focus:ring-2 focus:ring-[#e8365d]/15"
        />
      </label>

      {/* People */}
      <div>
        <h2 className="text-lg font-semibold text-white">How many people?</h2>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPeople((p) => Math.max(1, p - 1))}
            disabled={people <= 1}
            aria-label="Remove a person"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#FF8CA5] transition hover:bg-white/10 disabled:opacity-40"
          >
            <Minus size={18} />
          </button>

          <span className="w-10 text-center text-2xl font-bold text-white">{people}</span>

          <button
            type="button"
            onClick={() => setPeople((p) => Math.min(maxPeople, p + 1))}
            disabled={people >= maxPeople}
            aria-label="Add a person"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#FF8CA5] transition hover:bg-white/10 disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        </div>
        {maxParticipants !== null && (
          <p className="mt-2 text-xs text-white/50">Maximum {maxParticipants} people</p>
        )}
      </div>

      {/* Contact */}
      <div>
        <h2 className="text-lg font-semibold text-white">Your details</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-white/70">Full name</span>
            <input
              type="text"
              name="customer_name"
              required
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#242024] px-4 py-3 text-white [color-scheme:dark] placeholder:text-white/30 focus:border-[#e8365d] focus:outline-none focus:ring-2 focus:ring-[#e8365d]/15"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-white/70">WhatsApp number</span>
            <input
              type="tel"
              name="customer_phone"
              required
              placeholder="+260 97 123 4567"
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#242024] px-4 py-3 text-white [color-scheme:dark] placeholder:text-white/30 focus:border-[#e8365d] focus:outline-none focus:ring-2 focus:ring-[#e8365d]/15"
            />
          </label>
        </div>
      </div>

      {/* Payment preference */}
      <label className="block">
        <span className="text-sm font-medium text-white/70">How would you like to pay?</span>
        <select
          name="payment_method"
          defaultValue="mobile_money"
          className="mt-1 w-full rounded-xl border border-white/15 bg-[#242024] px-4 py-3 text-white [color-scheme:dark] placeholder:text-white/30 focus:border-[#e8365d] focus:outline-none focus:ring-2 focus:ring-[#e8365d]/15"
        >
          <option value="mobile_money">Mobile money</option>
          <option value="card">Card</option>
        </select>
      </label>

      {/* Total */}
      <div className="rounded-xl border border-white/10 bg-[#242024] p-4">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>
            {price !== null ? `K${price.toLocaleString("en-ZM")}` : "—"} × {people}{" "}
            {people === 1 ? "person" : "people"}
          </span>
          <span className="text-lg font-bold text-[#FF8CA5]">
            {total !== null ? `K${total.toLocaleString("en-ZM")}` : "Price on request"}
          </span>
        </div>
        <p className="mt-1 text-xs text-white/50">You won't be charged now.</p>
      </div>

      {/* Error from the server */}
      {state.error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || !date}
        className="w-full rounded-xl bg-[#e8365d] px-5 py-3 font-medium text-white transition hover:bg-[#d02d50] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Sending request..." : "Request booking"}
      </button>
    </form>
  )
}