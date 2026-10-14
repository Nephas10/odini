"use client"

import { useState, useTransition } from "react"
import { setListingActive } from "./_form/action"

type Props = {
  listingId: string
  isActive: boolean
}

// A switch on each listing card: Published (guests can see it) or Draft (hidden).
export default function ListingStatusToggle({ listingId, isActive }: Props) {
  const [active, setActive] = useState(isActive)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function toggle() {
    const next = !active
    setError("")
    setActive(next) // show the change straight away

    startTransition(async () => {
      const result = await setListingActive(listingId, next)
      if (!result.ok) {
        setActive(!next) // put it back if the server said no
        setError(result.error ?? "Something went wrong.")
      }
    })
  }

  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={toggle}
        disabled={isPending}
        className="inline-flex items-center gap-2 text-sm font-medium disabled:opacity-60"
      >
        <span
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            active ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              active ? "left-[22px]" : "left-0.5"
            }`}
          />
        </span>
        <span className={active ? "text-green-700" : "text-gray-500"}>
          {active ? "Published" : "Draft"}
        </span>
      </button>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}