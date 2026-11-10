
"use client"

import { useActionState, useState } from "react"
import { BedDouble, X } from "lucide-react"
import { updateRoomInventory } from "./action"

type Props = {
  listingId: string
  room: {
    id: string
    name: string
    total_rooms: number
  }
}

export default function RoomInventoryForm({
  listingId,
  room,
}: Props) {
  const [editing, setEditing] = useState(false)

  const action = updateRoomInventory.bind(
    null,
    listingId,
    room.id
  )

  const [state, formAction, isPending] = useActionState(
    action,
    {}
  )

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-2 rounded-xl
          border border-[#7A1F2B]/20 px-4 py-2
          text-sm font-medium text-[#7A1F2B]
          transition hover:bg-[#F7EDEF]"
      >
        <BedDouble size={16} />
        Adjust Inventory
      </button>
    )
  }

  return (
    <div className="w-full rounded-xl border border-[#7A1F2B]/15 bg-[#F7EDEF]/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            Adjust room inventory
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            {room.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="Close inventory editor"
          className="rounded-lg p-1 text-gray-500 hover:bg-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3">
        <p className="text-xs text-gray-500">
          Current inventory
        </p>

        <p className="mt-1 text-2xl font-bold text-[#7A1F2B]">
          {room.total_rooms}
          <span className="ml-2 text-sm font-normal text-gray-500">
            {room.total_rooms === 1 ? "room" : "rooms"}
          </span>
        </p>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            New total number of rooms
          </span>

          <input
            key={room.total_rooms}
            type="number"
            name="total_rooms"
            min={1}
            max={10000}
            step={1}
            required
            defaultValue={room.total_rooms}
            className="mt-2 w-full rounded-xl border border-gray-300
              bg-white px-4 py-3 text-gray-900
              focus:border-[#7A1F2B] focus:outline-none
              focus:ring-2 focus:ring-[#7A1F2B]/20"
          />
        </label>

        <p className="text-xs leading-5 text-gray-500">
          Increasing room inventory is allowed. Reducing it
          must not conflict with existing confirmed reservations.
        </p>

        {state.error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        {state.success && (
          <p
            role="status"
            className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[#7A1F2B]
            px-5 py-3 text-sm font-semibold text-white
            transition hover:bg-[#5E1721]
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Updating inventory..." : "Save Inventory"}
        </button>
      </form>
    </div>
  )
}
