
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type ActionResult = {
  success: boolean
  error?: string
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // 1. Verify the user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: "Please log in to manage notifications.",
    }
  }

  // 2. Validate the notification ID
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!uuidPattern.test(notificationId)) {
    return {
      success: false,
      error: "Invalid notification ID.",
    }
  }

  // 3. Call the secure database function
  const { data, error } = await supabase.rpc(
    "mark_notification_read",
    {
      p_notification_id: notificationId,
    }
  )

  if (error) {
    console.error(
      "Mark notification as read failed:",
      error.message
    )

    return {
      success: false,
      error: "Unable to update notification. Please try again.",
    }
  }

  // The database function returns false if no owned notification matched
  if (data !== true) {
    return {
      success: false,
      error: "Notification not found or access denied.",
    }
  }

  // 4. Revalidate the notifications page
  revalidatePath("/user/notifications")

  return {
    success: true,
  }
}
