"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type HostBookingAction = "confirm" | "cancel" | "mark_paid"

export type HostBookingResult = {
  ok: boolean
  error?: string
}

const ACTIONS: HostBookingAction[] = ["confirm", "cancel", "mark_paid"]

// Plain messages for each reason the database can refuse
const ERRORS: Record<string, string> = {
  not_logged_in: "Please log in again.",
  not_found: "This booking no longer exists.",
  not_your_booking: "This booking isn't on one of your listings.",
  not_pending: "Only pending bookings can be confirmed.",
  already_cancelled: "This booking is already cancelled.",
  is_cancelled: "A cancelled booking can't be marked as paid.",
  already_paid: "This booking is already marked as paid.",
}

// Confirm, cancel or mark paid. All the checks (is this your listing? is the
// change allowed?) happen in the database function host_update_booking.
export async function updateHostBooking(
  bookingId: string,
  action: HostBookingAction
): Promise<HostBookingResult> {
  if (!bookingId || !ACTIONS.includes(action)) {
    return { ok: false, error: "Something went wrong. Please reload the page." }
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc("host_update_booking", {
    p_booking_id: bookingId,
    p_action: action,
  })

  if (error) {
    const reason = Object.keys(ERRORS).find((key) => error.message.includes(key))
    if (!reason) console.error("updateHostBooking failed:", error.message)
    return { ok: false, error: reason ? ERRORS[reason] : "We couldn't update this booking. Please try again." }
  }

  // Refresh the pages that show booking counts and statuses
  revalidatePath("/host/bookings")
  revalidatePath("/host")

  return { ok: true }
}