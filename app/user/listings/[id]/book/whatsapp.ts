// Builds the WhatsApp click-to-chat link the customer taps after booking.
// No database, no UI: just turns booking details into a wa.me link.

// wa.me needs the number as digits only, with the country code and no leading 0.
// Handles the usual ways Zambian numbers get typed:
//   "+260 97 123 4567"  -> "260971234567"
//   "0971234567"        -> "260971234567"
//   "971234567"         -> "260971234567"
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null

  let digits = phone.replace(/\D/g, "")

  if (digits.startsWith("00")) digits = digits.slice(2) // 00260... -> 260...
  if (digits.startsWith("0")) digits = "260" + digits.slice(1) // 097... -> 26097...
  if (digits.length === 9) digits = "260" + digits // 97... -> 26097...

  // A full Zambian number is 260 + 9 digits = 12 digits
  return digits.length >= 11 && digits.length <= 15 ? digits : null
}

export type BookingMessageDetails = {
  reference: string
  listingTitle: string
  customerName: string
  // One line per detail, e.g. "Check-in: 12 Oct 2026", "Guests: 2"
  lines: string[]
  total: number | null
}

export function bookingMessage(details: BookingMessageDetails): string {
  const parts = [
    `Hello! I've just requested a booking on ODINI.`,
    ``,
    `Reference: ${details.reference}`,
    `Listing: ${details.listingTitle}`,
    `Name: ${details.customerName}`,
    ...details.lines,
  ]

  if (details.total !== null) {
    parts.push(`Total: K${details.total.toLocaleString("en-ZM")}`)
  }

  parts.push(``, `Please confirm when you can. Thank you!`)

  return parts.join("\n")
}

// Returns null when the host has no usable number, so the page can hide the button
export function whatsAppLink(
  hostPhone: string | null | undefined,
  details: BookingMessageDetails
): string | null {
  const number = toWhatsAppNumber(hostPhone)
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(bookingMessage(details))}`
}

// Formats a YYYY-MM-DD date as "12 Oct 2026" for the message
export function messageDate(date: string): string {
  return new Date(`${date}T12:00:00+02:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lusaka",
  })
}