"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { parseListingForm, type ListingType } from "./fields"

export type ListingFormState = {
  // One message per field, shown under that field
  errors?: Record<string, string>
  // A general message, shown at the top of the form
  error?: string
}

// Where each type's extra details live
const DETAILS_TABLE: Record<ListingType, "stays" | "events" | "activities"> = {
  stay: "stays",
  event: "events",
  activity: "activities",
}

// Creates a listing and its stay / event / activity details.
// If the details fail to save, the listing is removed again, so there's never half a listing.
export async function createListing(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const parsed = parseListingForm(formData)
  if (!parsed.ok) {
    return { errors: parsed.errors, error: "Please fix the highlighted fields." }
  }

  const supabase = await createClient()

  // Must be a logged-in host (checked here too, because actions can be called directly)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/host/listings/new")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (profile?.role !== "host") redirect("/host/become")

  const { listing, details } = parsed

  // 1. The listing itself
  const { data: created, error: listingError } = await supabase
    .from("listings")
    .insert({ ...listing, host_id: user.id })
    .select("id")
    .single()

  if (listingError || !created) {
    console.error("createListing (listing) failed:", listingError?.message)
    return { error: "We couldn't save your listing. Please try again." }
  }

  // 2. Its type-specific details. New events start with every ticket available.
  const detailsRow =
    listing.listing_type === "event" && "capacity" in details
      ? { ...details, available_slots: details.capacity }
      : details

  const { error: detailsError } = await supabase
    .from(DETAILS_TABLE[listing.listing_type])
    .insert({ ...detailsRow, listing_id: created.id })

  if (detailsError) {
    console.error("createListing (details) failed:", detailsError.message)
    // Undo step 1 so there's no listing without details
    await supabase.from("listings").delete().eq("id", created.id)
    return { error: "We couldn't save your listing details. Please try again." }
  }

  revalidatePath("/host")
  revalidatePath("/host/listings")
  revalidatePath("/user")

  redirect(`/host/listings?saved=${listing.is_active ? "published" : "draft"}`)
}

// Saves changes to an existing listing. The page binds the listing id:
// updateListing.bind(null, listingId)
export async function updateListing(
  listingId: string,
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const parsed = parseListingForm(formData)
  if (!parsed.ok) {
    return { errors: parsed.errors, error: "Please fix the highlighted fields." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=/host/listings/${listingId}/edit`)

  // Must be this host's listing, and the type can't change
  const { data: existing } = await supabase
    .from("listings")
    .select("id, listing_type, events(capacity, available_slots)")
    .eq("id", listingId)
    .eq("host_id", user.id)
    .maybeSingle()

  if (!existing) return { error: "This listing isn't yours or no longer exists." }

  const { listing, details } = parsed
  if (listing.listing_type !== existing.listing_type) {
    return { error: "A listing's type can't be changed. Create a new listing instead." }
  }

  // Events: keep the tickets already sold, and work out how many are left
  let detailsRow: Record<string, unknown> = { ...details }
  if (listing.listing_type === "event" && "capacity" in details) {
    const old = Array.isArray(existing.events) ? existing.events[0] : existing.events
    const oldCapacity = old?.capacity ?? 0
    const oldAvailable = old?.available_slots ?? oldCapacity
    const sold = Math.max(0, oldCapacity - oldAvailable)

    if (details.capacity < sold) {
      return {
        errors: { capacity: `${sold} tickets are already booked, so it can't go below ${sold}.` },
        error: "Please fix the highlighted fields.",
      }
    }
    detailsRow = { ...details, available_slots: details.capacity - sold }
  }

  // 1. The listing (everything except its type)
  const { listing_type: _type, ...listingChanges } = listing
  const { error: listingError } = await supabase
    .from("listings")
    .update(listingChanges)
    .eq("id", listingId)
    .eq("host_id", user.id)

  if (listingError) {
    console.error("updateListing (listing) failed:", listingError.message)
    return { error: "We couldn't save your changes. Please try again." }
  }

  // 2. Its details (upsert, in case an older listing never had a details row)
  const { error: detailsError } = await supabase
    .from(DETAILS_TABLE[listing.listing_type])
    .upsert({ ...detailsRow, listing_id: listingId }, { onConflict: "listing_id" })

  if (detailsError) {
    console.error("updateListing (details) failed:", detailsError.message)
    return { error: "Your main changes were saved, but the details couldn't be. Please try again." }
  }

  revalidatePath("/host")
  revalidatePath("/host/listings")
  revalidatePath(`/user/listings/${listingId}`)
  revalidatePath("/user")

  redirect(`/host/listings?saved=updated`)
}

// Publish or unpublish one listing from the listings page.
// Only works on the host's own listings; publishing needs at least one photo.
export async function setListingActive(
  listingId: string,
  active: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (!listingId) return { ok: false, error: "Something went wrong. Please reload the page." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Please log in again." }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, image_url")
    .eq("id", listingId)
    .eq("host_id", user.id)
    .maybeSingle()

  if (!listing) return { ok: false, error: "This listing isn't yours or no longer exists." }
  if (active && !listing.image_url) {
    return { ok: false, error: "Add at least one photo before publishing." }
  }

  const { error } = await supabase
    .from("listings")
    .update({ is_active: active })
    .eq("id", listingId)
    .eq("host_id", user.id)

  if (error) {
    console.error("setListingActive failed:", error.message)
    return { ok: false, error: "We couldn't update this listing. Please try again." }
  }

  revalidatePath("/host")
  revalidatePath("/host/listings")
  revalidatePath("/user")
  return { ok: true }
}


export async function deleteListing(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const listingId = formData.get("listingId")

  // 1. Validate the listing ID
  if (typeof listingId !== "string" || !listingId.trim()) {
    return {
      error: "Invalid listing. Please try again.",
    }
  }

  const supabase = await createClient()

  // 2. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login?next=/host/listings")
  }

  // 3. Verify listing ownership
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title")
    .eq("id", listingId)
    .eq("host_id", user.id)
    .maybeSingle()

  if (listingError) {
    console.error("deleteListing lookup failed:", listingError.message)
    return {
      error: "Unable to verify listing ownership.",
    }
  }

  if (!listing) {
    return {
      error: "This listing doesn't exist or doesn't belong to you.",
    }
  }

  // 4. Check whether the listing has bookings
  const { count, error: bookingsError } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId)

  if (bookingsError) {
    console.error("deleteListing booking check failed:", bookingsError.message)
    return {
      error: "Unable to verify booking history. Please try again.",
    }
  }

  if ((count ?? 0) > 0) {
    return {
      error: "This listing has booking history and cannot be deleted. You can unpublish it instead.",
    }
  }

  // 5. Delete only the authenticated host's listing
  const { data: deleted, error: deleteError } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("host_id", user.id)
    .select("id")
    .maybeSingle()

  if (deleteError) {
    console.error("deleteListing failed:", deleteError.message)

    return {
      error: "Unable to delete the listing. Please try again.",
    }
  }

  if (!deleted) {
    return {
      error: "The listing could not be deleted.",
    }
  }

  // 6. Refresh affected pages
  revalidatePath("/host")
  revalidatePath("/host/listings")
  revalidatePath("/user")
  revalidatePath("/")
  revalidatePath(`/listing/${listingId}`)
  revalidatePath(`/user/listings/${listingId}`)

  // 7. Return to listing management
  redirect("/host/listings?deleted=true")
}
