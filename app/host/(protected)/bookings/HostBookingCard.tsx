
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import {
  BedDouble,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Compass,
  MessageCircle,
  Phone,
  Ticket,
  UserRound,
  Wallet,
  X,
} from "lucide-react"

import {
  updateHostBooking,
  type HostBookingAction,
} from "./action"

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
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
}

const CATEGORY_ICONS = {
  stay: BedDouble,
  event: Ticket,
  activity: Compass,
}

function day(date: string) {
  return new Date(
    `${date}T12:00:00+02:00`
  ).toLocaleDateString("en-GB", {
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

// Keep existing Zambia WhatsApp number handling.
function waNumber(phone: string | null) {
  if (!phone) return null

  let d = phone.replace(/\D/g, "")

  if (d.startsWith("00")) d = d.slice(2)
  if (d.startsWith("0")) d = "260" + d.slice(1)
  if (d.length === 9) d = "260" + d

  return d.length >= 11 && d.length <= 15
    ? d
    : null
}

// Preserve the current pricing and booking summary.
function summary(b: HostBooking) {
  const price = b.listing?.price ?? null
  const type = b.listing?.listing_type

  if (
    type === "stay" &&
    b.check_in &&
    b.check_out
  ) {
    const nights = b.nights ?? 1

    return {
      lines: [
        `${day(b.check_in)} → ${day(b.check_out)} (${nights} ${
          nights === 1 ? "night" : "nights"
        })`,
        `${b.guests ?? 1} ${
          b.guests === 1 ? "guest" : "guests"
        }`,
      ],
      total: price !== null
        ? price * nights
        : null,
    }
  }

  if (type === "event") {
    return {
      lines: [
        ...(b.booking_date
          ? [dateTime(b.booking_date)]
          : []),
        `${b.quantity} ${
          b.quantity === 1 ? "ticket" : "tickets"
        }`,
      ],
      total: price !== null
        ? price * b.quantity
        : null,
    }
  }

  const people = b.guests ?? b.quantity

  return {
    lines: [
      ...(b.booking_date
        ? [day(b.booking_date.slice(0, 10))]
        : []),
      `${people} ${
        people === 1 ? "person" : "people"
      }`,
    ],
    total: price !== null
      ? price * people
      : null,
  }
}

type Props = {
  booking: HostBooking
}

export default function HostBookingCard({
  booking,
}: Props) {
  const router = useRouter()

  const [isPending, startTransition] =
    useTransition()

  const [error, setError] = useState("")

  const { lines, total } = summary(booking)

  const isCancelled =
    booking.status === "cancelled"

  const isPaid =
    booking.payment_status === "paid"

  const listingType =
    booking.listing?.listing_type ?? "listing"

  const CategoryIcon =
    CATEGORY_ICONS[
      listingType as keyof typeof CATEGORY_ICONS
    ] ?? Compass

  const paymentMethod =
    booking.payment_method === "card"
      ? "Card"
      : booking.payment_method === "mobile_money"
        ? "Mobile money"
        : "Not specified"

  function run(action: HostBookingAction) {
    if (
      action === "cancel" &&
      !window.confirm(
        "Cancel this booking? Remember to inform the guest on WhatsApp."
      )
    ) {
      return
    }

    setError("")

    startTransition(async () => {
      try {
        const result = await updateHostBooking(
          booking.id,
          action
        )

        if (!result.ok) {
          setError(
            result.error ?? "Something went wrong."
          )
          return
        }

        // Refresh booking data and dashboard counts.
        router.refresh()
      } catch {
        setError(
          "Unable to update this booking. Please try again."
        )
      }
    })
  }

  const number = waNumber(
    booking.customer_phone
  )

  const waText = encodeURIComponent(
    `Hello ${booking.customer_name ?? ""}, ` +
      `this is about your ODINI booking ` +
      `${booking.booking_reference ?? ""} ` +
      `for ${booking.listing?.title ?? "your booking"}.`
  )

  const actionClass =
    "inline-flex min-h-10 items-center justify-center gap-2 " +
    "rounded-xl px-4 py-2.5 text-sm font-semibold " +
    "transition disabled:cursor-not-allowed " +
    "disabled:opacity-50"

  return (
    <article
      aria-busy={isPending}
      className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-md ${
        isPending ? "opacity-70" : ""
      }`}
    >
      {/* BOOKING HEADER */}
      <div className="flex flex-col gap-4 border-b border-gray-100 bg-[#FCFBFB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#3D0F15] sm:text-sm">
            {booking.booking_reference ??
              "No reference"}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${
              STATUS_STYLES[booking.status] ??
              "bg-gray-100 text-gray-600"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                booking.status === "confirmed"
                  ? "bg-emerald-500"
                  : booking.status === "cancelled"
                    ? "bg-red-500"
                    : "bg-amber-500"
              }`}
            />
            {booking.status}
          </span>

          {!isCancelled && (
            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                isPaid
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isPaid ? "Paid" : "Not paid yet"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock3 size={14} />
          Requested {dateTime(booking.created_at)}
        </div>
      </div>

      {/* BOOKING DETAILS */}
      <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* LEFT: LISTING & RESERVATION */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7EDEF] text-[#7A1F2B]">
              <CategoryIcon size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A1F2B]">
                {listingType}
              </p>

              <h3 className="mt-1 line-clamp-2 text-lg font-bold text-[#3D0F15]">
                {booking.listing?.title ??
                  "Listing no longer available"}
              </h3>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Reservation details
            </p>

            <div className="mt-3 space-y-2.5">
              {lines.map((line, index) => (
                <div
                  key={`${index}-${line}`}
                  className="flex items-start gap-3 text-sm text-gray-600"
                >
                  <CalendarDays
                    size={16}
                    className="mt-0.5 shrink-0 text-[#7A1F2B]"
                  />

                  <span className="leading-6">
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: GUEST & PAYMENT */}
        <div className="rounded-2xl border border-[#7A1F2B]/10 bg-[#F8F7F7] p-5">
          <div className="flex items-center gap-2">
            <UserRound
              size={17}
              className="text-[#7A1F2B]"
            />

            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Guest Information
            </p>
          </div>

          <p className="mt-4 font-bold text-[#3D0F15]">
            {booking.customer_name ?? "Guest"}
          </p>

          <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Phone
              size={15}
              className="shrink-0"
            />
            {booking.customer_phone ??
              "No phone provided"}
          </p>

          <div className="mt-5 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Wallet size={15} />
              Payment method: {paymentMethod}
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Estimated Total
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight text-[#7A1F2B]">
              {total !== null
                ? `K${total.toLocaleString("en-ZM")}`
                : "Price on request"}
            </p>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="mx-5 mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6"
        >
          {error}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 bg-[#FCFBFB] px-5 py-4 sm:px-6">
        {booking.status === "pending" && (
          <button
            type="button"
            onClick={() => run("confirm")}
            disabled={isPending}
            className={`${actionClass} bg-[#7A1F2B] text-white hover:bg-[#5E1721]`}
          >
            <Check size={17} />
            Confirm Booking
          </button>
        )}

        {!isCancelled && !isPaid && (
          <button
            type="button"
            onClick={() => run("mark_paid")}
            disabled={isPending}
            className={`${actionClass} border border-[#7A1F2B]/20 bg-white text-[#7A1F2B] hover:bg-[#F7EDEF]`}
          >
            <CircleDollarSign size={17} />
            Mark Paid
          </button>
        )}

        {number && (
          <a
            href={`https://wa.me/${number}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${actionClass} bg-[#1FA855] text-white hover:bg-[#198C46]`}
          >
            <MessageCircle size={17} />
            WhatsApp Guest
          </a>
        )}

        {!isCancelled && (
          <button
            type="button"
            onClick={() => run("cancel")}
            disabled={isPending}
            className={`${actionClass} text-red-600 hover:bg-red-50 sm:ml-auto`}
          >
            <X size={17} />
            Cancel
          </button>
        )}
      </div>
    </article>
  )
}
