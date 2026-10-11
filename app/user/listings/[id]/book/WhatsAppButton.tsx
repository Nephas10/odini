import { MessageCircle } from "lucide-react"

type Props = {
  url?: string
}

// Shown on the booking confirmation. Opens WhatsApp with the booking details
// already written out for the host. Shows nothing if the host has no number.
export default function WhatsAppButton({ url }: Props) {
  if (!url) {
    return (
      <p className="mx-auto mt-6 max-w-sm text-sm text-gray-500">
        The host will contact you to confirm. You can track this booking with your reference.
      </p>
    )
  }

  return (
    <div className="mt-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1FA855] px-5 py-3 font-medium text-white transition hover:bg-[#198C46] sm:w-auto"
      >
        <MessageCircle size={20} />
        Message host on WhatsApp
      </a>
      <p className="mx-auto mt-3 max-w-sm text-xs text-gray-500">
        Send the message so the host can confirm your booking.
      </p>
    </div>
  )
}