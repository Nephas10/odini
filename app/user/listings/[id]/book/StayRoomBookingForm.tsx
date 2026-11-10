
"use client"

import { useActionState, useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import WhatsAppButton from "./WhatsAppButton"
import {
  getStayRoomAvailability,
  type BookingState,
} from "./action"

type RoomType = {
  id: string
  name: string
  description: string | null
  price_per_night: number
  total_rooms: number
  max_guests_per_room: number
}

type Props = {
  listingId: string
  roomTypes: RoomType[]
  action: (
    prevState: BookingState,
    formData: FormData
  ) => Promise<BookingState>
}

const inputClass =
  "mt-1 w-full rounded-xl border border-gray-300 bg-white " +
  "px-4 py-3 text-gray-900 outline-none " +
  "focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/20"

function todayInZambia() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lusaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return `${value("year")}-${value("month")}-${value("day")}`
}

function nextDate(value: string) {
  if (!value) return todayInZambia()

  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)

  return date.toISOString().slice(0, 10)
}

function countNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return 0
  }

  return Math.round(
    (new Date(`${checkOut}T00:00:00Z`).getTime() -
      new Date(`${checkIn}T00:00:00Z`).getTime()) /
      86_400_000
  )
}

export default function StayRoomBookingForm({
  listingId,
  roomTypes,
  action,
}: Props) {
  const [state, formAction, isPending] =
    useActionState(action, {})

  const [roomTypeId, setRoomTypeId] = useState(
    roomTypes[0]?.id ?? ""
  )

  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [roomsBooked, setRoomsBooked] = useState(1)
  const [guests, setGuests] = useState(1)

  const [checking, setChecking] = useState(false)
  const [availabilityError, setAvailabilityError] = useState("")

  const [availability, setAvailability] = useState<{
    key: string
    rooms: { id: string; available: number }[]
  } | null>(null)

  const selectedRoom = roomTypes.find(
    (room) => room.id === roomTypeId
  )

  const nights = countNights(checkIn, checkOut)
  const rangeKey = `${checkIn}|${checkOut}`

  // Only use availability returned for these exact dates.
  const available =
    availability?.key === rangeKey
      ? availability.rooms.find(
          (room) => room.id === roomTypeId
        )?.available ?? 0
      : null

  const maxGuests =
    (selectedRoom?.max_guests_per_room ?? 0) * roomsBooked

  const total =
    selectedRoom && nights > 0
      ? selectedRoom.price_per_night * roomsBooked * nights
      : 0

  // Refresh room availability whenever dates change.
  useEffect(() => {
    if (!checkIn || !checkOut || nights < 1 || nights > 90) {
      return
    }

    let cancelled = false

    getStayRoomAvailability(listingId, checkIn, checkOut)
      .then((result) => {
        if (cancelled) return

        if (!result.ok) {
          setAvailabilityError(
            result.error ?? "Unable to check room availability."
          )
          setAvailability(null)
          return
        }

        setAvailability({
          key: `${checkIn}|${checkOut}`,
          rooms: result.rooms,
        })

        setAvailabilityError("")
      })
      .catch(() => {
        if (cancelled) return

        setAvailability(null)
        setAvailabilityError("Unable to check room availability.")
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => {
      cancelled = true
    }
  }, [listingId, checkIn, checkOut, nights])

  // A successful request shows confirmation instead.
  if (state.reference) {
    return (
      <div className="py-6 text-center">
        <CheckCircle2
          size={48}
          className="mx-auto text-[#7A1F2B]"
        />

        <h2 className="mt-4 text-xl font-bold text-gray-900">
          Booking request sent
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Your booking reference is
        </p>

        <p className="mt-1 text-2xl font-bold text-[#7A1F2B]">
          {state.reference}
        </p>

        <p className="mx-auto mt-4 max-w-sm text-sm text-gray-500">
          Your request is pending host confirmation.
          Keep your reference handy.
        </p>

        <WhatsAppButton url={state.whatsappUrl} />
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-7">
      <input
        type="hidden"
        name="listing_id"
        value={listingId}
      />

      <input
        type="hidden"
        name="stay_room_type_id"
        value={roomTypeId}
      />

      {/* Room selection */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900">
          Choose your room
        </h2>

        <div className="mt-3 space-y-3">
          {roomTypes.map((room) => {
            const selected = roomTypeId === room.id

            return (
              <label
                key={room.id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                  selected
                    ? "border-[#7A1F2B] bg-[#F7EDEF]"
                    : "border-gray-200 hover:border-[#7A1F2B]/40"
                }`}
              >
                <input
                  type="radio"
                  checked={selected}
                  onChange={() => {
                    setRoomTypeId(room.id)
                    setRoomsBooked(1)
                    setGuests(1)
                  }}
                  className="mt-1 accent-[#7A1F2B]"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold text-gray-900">
                      {room.name}
                    </span>

                    <span className="font-bold text-[#7A1F2B]">
                      K{room.price_per_night.toLocaleString("en-ZM")}
                      <span className="ml-1 text-xs font-normal">
                        / night
                      </span>
                    </span>
                  </div>

                  {room.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {room.description}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Up to {room.max_guests_per_room} guests per room
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      </section>

      {/* Dates */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900">
          Your dates
        </h2>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Check-in
            </span>

            <input
              type="date"
              name="check_in"
              required
              min={todayInZambia()}
              value={checkIn}
              onChange={(event) => {
                const value = event.target.value
                setCheckIn(value)

                if (checkOut && checkOut <= value) {
                  setCheckOut("")
                }
              }}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Checkout
            </span>

            <input
              type="date"
              name="check_out"
              required
              min={nextDate(checkIn)}
              value={checkOut}
              onChange={(event) =>
                setCheckOut(event.target.value)
              }
              className={inputClass}
            />
          </label>
        </div>

        {nights > 90 && (
          <p className="mt-2 text-sm text-red-600">
            Please choose a stay of 90 nights or fewer.
          </p>
        )}

        {checkIn && checkOut && nights > 0 && nights <= 90 && (
          <div className="mt-3 rounded-xl bg-[#F7EDEF] p-3">
            {available === null ? (
              <p className="text-sm text-[#7A1F2B]">
                {checking
                  ? "Checking room availability..."
                  : availabilityError || "Checking availability..."}
              </p>
            ) : (
              <p className="text-sm font-medium text-[#7A1F2B]">
                {available === 0
                  ? "Fully booked for the selected dates."
                  : `${available} ${
                      available === 1 ? "room" : "rooms"
                    } available for these dates.`}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Quantity and guests */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Number of rooms
          </span>

          <input
            type="number"
            name="rooms_booked"
            min={1}
            max={Math.min(10, available ?? 10)}
            required
            value={roomsBooked}
            onChange={(event) => {
              const value = Number(event.target.value)
              setRoomsBooked(value)
            }}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Total guests
          </span>

          <input
            type="number"
            name="guests"
            min={1}
            max={maxGuests || undefined}
            required
            value={guests}
            onChange={(event) =>
              setGuests(Number(event.target.value))
            }
            className={inputClass}
          />
        </label>
      </div>

      <p className="text-xs text-gray-500">
        Your selected rooms accommodate up to {maxGuests} guests.
      </p>

      {/* Contact information */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900">
          Your details
        </h2>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Full name
            </span>

            <input
              name="customer_name"
              type="text"
              required
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              WhatsApp number
            </span>

            <input
              name="customer_phone"
              type="tel"
              required
              placeholder="+260 97 123 4567"
              className={inputClass}
            />
          </label>
        </div>
      </section>

      {/* Payment preference */}
      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          How would you like to pay?
        </span>

        <select
          name="payment_method"
          defaultValue="mobile_money"
          className={inputClass}
        >
          <option value="mobile_money">Mobile money</option>
          <option value="card">Card</option>
        </select>
      </label>

      {/* Booking summary */}
      <div className="rounded-xl bg-[#F7EDEF] p-4">
        <p className="text-sm text-gray-700">
          {selectedRoom?.name ?? "Room"}
        </p>

        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-700">
            K{selectedRoom?.price_per_night.toLocaleString("en-ZM") ?? "0"}
            {" × "}{roomsBooked}{" "}
            {roomsBooked === 1 ? "room" : "rooms"}
            {" × "}{nights}{" "}
            {nights === 1 ? "night" : "nights"}
          </p>

          <p className="text-xl font-bold text-[#7A1F2B]">
            K{total.toLocaleString("en-ZM")}
          </p>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          No payment is collected now. The host must confirm
          your request before the rooms are reserved.
        </p>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={
          isPending ||
          nights < 1 ||
          nights > 90 ||
          available === null ||
          available < roomsBooked ||
          !Number.isInteger(roomsBooked) ||
          roomsBooked < 1 ||
          roomsBooked > 10 ||
          !Number.isInteger(guests) ||
          guests < 1 ||
          guests > maxGuests
        }
        className="w-full rounded-xl bg-[#7A1F2B] px-5 py-3
          font-semibold text-white transition hover:bg-[#5E1721]
          disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Sending request..." : "Request booking"}
      </button>
    </form>
  )
}
