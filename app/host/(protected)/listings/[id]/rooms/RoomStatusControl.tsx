
"use client"

import { useActionState } from "react"
import { CheckCircle2, PauseCircle } from "lucide-react"
import { setRoomTypeActive } from "./action"

type Props = {
  listingId: string
  room: {
    id: string
    is_active: boolean
  }
}

export default function RoomStatusControl({
  listingId,
  room,
}: Props) {
  const action = setRoomTypeActive.bind(
    null,
    listingId,
    room.id,
    !room.is_active
  )

  const [state, formAction, isPending] = useActionState(
    action,
    {}
  )

  return (
    <form action={formAction} className="space-y-2">
      <button
        type="submit"
        disabled={isPending}
        className={`inline-flex items-center gap-2 rounded-xl
          px-4 py-2 text-sm font-medium transition
          disabled:cursor-not-allowed disabled:opacity-50 ${
            room.is_active
              ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
              : "border border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
          }`}
      >
        {room.is_active ? (
          <PauseCircle size={16} />
        ) : (
          <CheckCircle2 size={16} />
        )}

        {isPending
          ? "Updating..."
          : room.is_active
            ? "Deactivate"
            : "Activate"}
      </button>

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
    </form>
  )
}
