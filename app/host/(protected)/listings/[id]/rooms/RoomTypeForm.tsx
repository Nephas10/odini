
"use client"

import { useActionState } from "react"
import { createRoomType } from "./action"

type Props = {
  listingId: string
}

const inputClass =
  "mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 " +
  "text-gray-900 outline-none focus:border-[#7A1F2B] " +
  "focus:ring-2 focus:ring-[#7A1F2B]/20"

export default function RoomTypeForm({ listingId }: Props) {
  const action = createRoomType.bind(null, listingId)

  const [state, formAction, isPending] = useActionState(action, {})

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Add room type
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Add a category of rooms with its own price and capacity.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Room type name
        </span>
        <input
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="e.g. Deluxe Room"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Description (optional)
        </span>
        <textarea
          name="description"
          rows={3}
          placeholder="Describe this room category..."
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Price per night (K)
          </span>
          <input
            name="price_per_night"
            type="number"
            min={0}
            step={1}
            required
            placeholder="450"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Total rooms
          </span>
          <input
            name="total_rooms"
            type="number"
            min={1}
            step={1}
            required
            placeholder="4"
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Maximum guests per room
        </span>
        <input
          name="max_guests_per_room"
          type="number"
          min={1}
          step={1}
          required
          placeholder="2"
          className={inputClass}
        />
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {state.success && (
        <p
          role="status"
          className="rounded-xl bg-green-50 p-3 text-sm text-green-700"
        >
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#7A1F2B] px-5 py-3
          font-semibold text-white transition hover:bg-[#5E1721]
          disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Adding room..." : "Add Room Type"}
      </button>
    </form>
  )
}
