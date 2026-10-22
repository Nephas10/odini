
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type SavedListingResult = {
  success: boolean
  error?: string
}

export async function setListingSaved(
  listingId: string,
  shouldSave: boolean
): Promise<SavedListingResult> {

  const supabase = await createClient()

  // 1. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: "Please log in to save listings.",
    }
  }

  // 2. Validate listing ID
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!uuidPattern.test(listingId)) {
    return {
      success: false,
      error: "Invalid listing ID.",
    }
  }

  if (shouldSave) {

    // 3. Verify the listing exists and is published
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id")
      .eq("id", listingId)
      .eq("is_active", true)
      .maybeSingle()

    if (listingError || !listing) {
      return {
        success: false,
        error: "This listing is no longer available.",
      }
    }

    // 4. Save the listing
    const { error } = await supabase
      .from("saved_listings")
      .insert({
        user_id: user.id,
        listing_id: listingId,
      })

    // 23505 means the listing was already saved
    if (error && error.code !== "23505") {
      console.error("Save listing failed:", error.message)

      return {
        success: false,
        error: "Unable to save listing. Please try again.",
      }
    }

  } else {

    // 5. Remove the listing from saved items
    const { error } = await supabase
      .from("saved_listings")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId)

    if (error) {
      console.error("Remove saved listing failed:", error.message)

      return {
        success: false,
        error: "Unable to remove saved listing.",
      }
    }
  }

  // 6. Refresh affected pages
  revalidatePath("/user/saved")
  revalidatePath("/user")

  return {
    success: true,
  }
}
