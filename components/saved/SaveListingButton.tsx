
"use client"

import { useState, useTransition } from "react"
import { Bookmark } from "lucide-react"
import { setListingSaved } from "@/app/user/saved/action"
import { useRouter } from "next/navigation"

type Props = {
  listingId: string
  initialSaved?: boolean
}

export default function SaveListingButton({
  listingId,
  initialSaved = false,
}: Props) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const router = useRouter()

  function handleSave() {
    if (isPending) return

    setError("")

    startTransition(async () => {
      const result = await setListingSaved(
        listingId,
        !isSaved
      )

      if (!result.success) {
        setError(result.error ?? "Something went wrong.")
        return
      }

      setIsSaved((current) => !current)
      router.refresh()
    })
  }

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        aria-label={
          isSaved ? "Remove from saved listings" : "Save listing"
        }
        aria-pressed={isSaved}
        title={
          isSaved ? "Remove from saved" : "Save listing"
        }
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition disabled:cursor-wait disabled:opacity-50 ${
          isSaved
            ? "border-[#e8365d] bg-[#e8365d] text-white"
            : "border-gray-200 bg-white text-gray-500 hover:border-[#e8365d] hover:text-[#e8365d]"
        }`}
      >
        <Bookmark
          size={19}
          fill={isSaved ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </button>

      {error && (
        <p role="alert" className="max-w-48 text-center text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
