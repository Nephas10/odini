
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCheck } from "lucide-react"

import { markNotificationAsRead } from "@/app/user/notifications/action"

type Props = {
  notificationId: string
}

export default function MarkAsReadButton({
  notificationId,
}: Props) {
  const router = useRouter()

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [isRead, setIsRead] = useState(false)

  function handleMarkAsRead() {
    if (isPending || isRead) return

    setError("")

    startTransition(async () => {
      try {
        const result = await markNotificationAsRead(notificationId)

        if (!result.success) {
          setError(
            result.error ?? "Unable to mark notification as read."
          )
          return
        }

        // Update the button immediately
        setIsRead(true)

        // Refresh server-rendered notification data
        router.refresh()
      } catch {
        setError("Something went wrong. Please try again.")
      }
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleMarkAsRead}
        disabled={isPending || isRead}
        className="inline-flex items-center gap-2 rounded-lg border border-[#e8365d]/30 px-3 py-2 text-xs font-semibold text-[#e8365d] transition hover:bg-[#e8365d]/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCheck size={15} />

        {isPending
          ? "Updating..."
          : isRead
          ? "Marked as read"
          : "Mark as read"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
