
"use client"

import { useActionState, useState } from "react"
import { Pencil } from "lucide-react"
import { updateRoomType } from "./action"

type Props = {
  listingId: string
  room: {
    id: string
    name: string
    description: string | null
    price_per_night: number
  }
}

export default function EditRoomTypeForm({
  listingId,
  room,
}: Props) {
  const [editing, setEditing] = useState(false)

  const action = updateRoomType.bind(
    null,
    listingId,
    room.id
  )

  const [state, formAction, isPending] =
    useActionState(action, {})

  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-300 " +
    "bg-white px-4 py-3 text-gray-900 " +
    "focus:border-[#7A1F2B] focus:outline-none"

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
        <Pencil size={15} />
        Edit room
      </button>
    )
  }

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Room name
        </span>
        <input
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={room.name}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Description
        </span>
        <textarea
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={room.description ?? ""}
          className={inputClass}
        />
      </label>

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
          defaultValue={room.price_per_night}
          className={inputClass}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      {state.success && (
        <p role="status" className="text-sm text-green-700">
          {state.success}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#7A1F2B] px-5 py-2.5
            text-sm font-semibold text-white
            hover:bg-[#5E1721] disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-xl border border-gray-300
            px-5 py-2.5 text-sm font-medium text-gray-700"
        >
          Close
        </button>
      </div>
    </form>
  )
}
