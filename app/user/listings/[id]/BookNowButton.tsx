import Link from "next/link"

type Props = {
  listingId: string
  label?: string
  // e.g. when an event is sold out
  disabled?: boolean
  disabledLabel?: string
}

// The button in each listing's price card that takes the customer to the booking page.
export default function BookNowButton({
  listingId,
  label = "Book now",
  disabled = false,
  disabledLabel = "Not available",
}: Props) {
  if (disabled) {
    return (
      <span className="mt-5 block w-full cursor-not-allowed rounded-xl bg-gray-200 px-5 py-3 text-center font-medium text-gray-500">
        {disabledLabel}
      </span>
    )
  }

  return (
    <Link
      href={`/user/listings/${listingId}/book`}
      className="mt-5 block w-full rounded-xl bg-[#7A1F2B] px-5 py-3 text-center font-medium text-white transition hover:bg-[#5E1721]"
    >
      {label}
    </Link>
  )
}