"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBookingAction } from "./action"

type Props = {
  listingId: string
}

export default function BookingForm({ listingId }: Props) {
  const router = useRouter()
  const [bookingDate, setBookingDate] = useState("")
  const [quantity, setQuantity] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  

  async function handleBooking() {
    setError("")
   

    if (!bookingDate) {
      setError("Please select a booking date.")
      return
    }
    const selectedDate = new Date(bookingDate)
    const now = new Date()

    if(selectedDate < now){
      setError("Please select a future booking date.")
      return
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Quantity must be a whole number greater than 0.")
      return
    }

    setLoading(true)

    const result = await createBookingAction(
      listingId,
      bookingDate,
      quantity,
      
    )

    setLoading(false)

    if (!result.success) {
    setError(error)
    setLoading(false)
    return
    }

    router.push("/user/bookings")
  }

  return (
    <div className="mt-6 space-y-5">

      {/* Date */}
      <div>
        <label
          htmlFor="bookingDate"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Booking date
        </label>

        <input
          id="bookingDate"
          type="datetime-local"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
        />
      </div>

      {/* Quantity */}
      <div>
        <label
          htmlFor="quantity"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Quantity
        </label>

        <input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Success */}
      

      {/* Button */}
      <button
        onClick={handleBooking}
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 px-6 py-3.5 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating booking..." : "Confirm Booking"}
      </button>

    </div>
  )
}