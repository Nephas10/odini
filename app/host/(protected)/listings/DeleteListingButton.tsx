


"use client"

import { useActionState } from "react"
import { Trash2 } from "lucide-react"

import { deleteListing } from "./_form/action"

type Props = {
  listingId: string
  listingTitle: string
}

export default function DeleteListingButton({
  listingId,
  listingTitle,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    deleteListing,
    {}
  )

  function confirmDeletion(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listingTitle}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      event.preventDefault()
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={confirmDeletion}
    >
      <input
        type="hidden"
        name="listingId"
        value={listingId}
      />

      <button
        type="submit"
        disabled={isPending}
        title="Delete listing"
        aria-label={`Delete ${listingTitle}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:border-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>

      {state.error && (
        <p
          role="alert"
          className="mt-2 max-w-48 text-xs text-red-600"
        >
          {state.error}
        </p>
      )}
    </form>
  )
}
