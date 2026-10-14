"use client"

import { useState, useTransition } from "react"
import { Check, CircleDollarSign, MessageCircle, X } from "lucide-react"
import { updateHostBooking, type HostBookingAction } from "./action"

export type HostBooking = {
  id: string
  booking_reference: string | null
  status: string
  payment_status: string | null
  payment_method: string | null
  check_in: string | null
  check_out: string | null
  nights: number | null
  booking_date: string | null
  guests: number | null
  quantity: number
  customer_name: string | null
  customer_phone: string | null
  created_at: string
  listing: {
    title: string
    listing_type: string
    price: number | null
  } | null
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#D4A64A]/15 text-[#8A6A1F]",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

// "2026-10-16" -> "Fri 16 Oct"
function day(date: string) {
  return new Date(`${date}T12:00:00+02:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Africa/Lusaka",
  })
}

function dateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lusaka",
  })
}

// wa.me needs digits with country code: "097 123 4567" -> "260971234567"
function waNumber(phone: string | null) {
  if (!phone) return null
  let d = phone.replace(/\D/g, "")
  if (d.startsWith("00")) d = d.slice(2)
  if (d.startsWith("0")) d = "260" + d.slice(1)
  if (d.length === 9) d = "260" + d
  return d.length >= 11 && d.length <= 15 ? d : null
}

// What was booked, and the total, depending on the listing type
function summary(b: HostBooking) {
  const price = b.listing?.price ?? null
  const type = b.listing?.listing_type

  if (type === "stay" && b.check_in && b.check_out) {
    const nights = b.nights ?? 1
    return {
      lines: [
        `${day(b.check_in)} → ${day(b.check_out)} (${nights} ${nights === 1 ? "night" : "nights"})`,
        `${b.guests ?? 1} ${b.guests === 1 ? "guest" : "guests"}`,
      ],
      total: price !== null ? price * nights : null,
    }
  }
  if (type === "event") {
    return {
      lines: [
        ...(b.booking_date ? [dateTime(b.booking_date)] : []),
        `${b.quantity} ${b.quantity === 1 ? "ticket" : "tickets"}`,
      ],
      total: price !== null ? price * b.quantity : null,
    }
  }
  // activity
  const people = b.guests ?? b.quantity
  return {
    lines: [
      ...(b.booking_date ? [day(b.booking_date.slice(0, 10))] : []),
      `${people} ${people === 1 ? "person" : "people"}`,
    ],
    total: price !== null ? price * people : null,
  }
}

// One booking for the host: details, and the confirm / cancel / mark paid buttons.
// Only shows the buttons that make sense for the booking's current state.
export default function HostBookingCard({ booking }: { booking: HostBooking }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const { lines, total } = summary(booking)
  const isCancelled = booking.status === "cancelled"
  const isPaid = booking.payment_status === "paid"

  function run(action: HostBookingAction) {
    if (action === "cancel" && !window.confirm("Cancel this booking? The guest should be told on WhatsApp.")) {
      return
    }
    setError("")
    startTransition(async () => {
      const result = await updateHostBooking(booking.id, action)
      if (!result.ok) setError(result.error ?? "Something went wrong.")
    })
  }

  // WhatsApp the guest, with the reference already written in
  const number = waNumber(booking.customer_phone)
  const waText = encodeURIComponent(
    `Hello ${booking.customer_name ?? ""}, this is about your ODINI booking ${booking.booking_reference ?? ""} for ${booking.listing?.title ?? "your booking"}.`
  )

  return (
    <article
      className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition sm:p-6 ${
        isPending ? "opacity-60" : ""
      }`}
    >
      {/* Top row: reference, status, payment */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold text-gray-900">
          {booking.booking_reference ?? "No reference"}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            STATUS_STYLES[booking.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {booking.status}
        </span>
        {!isCancelled && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isPaid ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            {isPaid ? "Paid" : "Not paid yet"}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-400">Requested {dateTime(booking.created_at)}</span>
      </div>

      {/* Listing + what was booked */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7A1F2B]">
            {booking.listing?.listing_type ?? "listing"}
          </p>
          <h3 className="mt-1 font-semibold text-gray-900">
            {booking.listing?.title ?? "Listing no longer available"}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-[#F7EDEF] p-4">
          <p className="text-sm font-semibold text-gray-900">{booking.customer_name ?? "Guest"}</p>
          <p className="mt-0.5 text-sm text-gray-600">{booking.customer_phone ?? "No phone given"}</p>
          <p className="mt-3 text-xs text-gray-500">
            Pays by {booking.payment_method === "card" ? "card" : "mobile money"}
          </p>
          <p className="text-lg font-bold text-[#7A1F2B]">
            {total !== null ? `K${total.toLocaleString("en-ZM")}` : "Price on request"}
          </p>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        {booking.status === "pending" && (
          <button
            onClick={() => run("confirm")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#7A1F2B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5E1721] disabled:opacity-50"
          >
            <Check size={16} />
            Confirm
          </button>
        )}

        {!isCancelled && !isPaid && (
          <button
            onClick={() => run("mark_paid")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#7A1F2B]/30 px-4 py-2 text-sm font-semibold text-[#7A1F2B] transition hover:bg-[#F7EDEF] disabled:opacity-50"
          >
            <CircleDollarSign size={16} />
            Mark paid
          </button>
        )}

        {number && (
          <a
            href={`https://wa.me/${number}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1FA855] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#198C46]"
          >
            <MessageCircle size={16} />
            WhatsApp guest
          </a>
        )}

        {!isCancelled && (
          <button
            onClick={() => run("cancel")}
            disabled={isPending}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <X size={16} />
            Cancel
          </button>
        )}
      </div>
    </article>
  )
}