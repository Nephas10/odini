
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type RoomTypeState = {
  error?: string
  success?: string
}

export async function createRoomType(
  listingId: string,
  _prevState: RoomTypeState,
  formData: FormData
): Promise<RoomTypeState> {
  const supabase = await createClient()

  // 1. Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Please log in again." }
  }

  // 2. Verify this user is the host
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "host") {
    return { error: "Only hosts can manage rooms." }
  }

  // 3. Verify listing ownership and type
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .eq("host_id", user.id)
    .eq("listing_type", "stay")
    .maybeSingle()

  if (listingError || !listing) {
    return {
      error: "This property does not exist or does not belong to you.",
    }
  }

  // 4. Read form fields
  const name = String(formData.get("name") ?? "").trim()
  const description = String(
    formData.get("description") ?? ""
  ).trim()

  const rawPrice = String(formData.get("price_per_night") ?? "")
  const rawRooms = String(formData.get("total_rooms") ?? "")
  const rawGuests = String(formData.get("max_guests_per_room") ?? "")

  const price = Number(rawPrice)
  const totalRooms = Number(rawRooms)
  const maxGuests = Number(rawGuests)

  // 5. Validate inputs
  if (!name || name.length > 100) {
    return { error: "Enter a room name of up to 100 characters." }
  }

  if (
    rawPrice.trim() === "" ||
    !Number.isSafeInteger(price) ||
    price < 0 ||
    price > 2147483647
  ) {
    return { error: "Enter a valid nightly price in Kwacha." }
  }

  if (
    rawRooms.trim() === "" ||
    !Number.isSafeInteger(totalRooms) ||
    totalRooms < 1 ||
    totalRooms > 10000
  ) {
    return { error: "Enter a valid number of rooms." }
  }

  if (
    rawGuests.trim() === "" ||
    !Number.isSafeInteger(maxGuests) ||
    maxGuests < 1 ||
    maxGuests > 1000
  ) {
    return { error: "Enter a valid guest capacity per room." }
  }

  // 6. Create the room category
  const { error } = await supabase
    .from("stay_room_types")
    .insert({
      listing_id: listingId,
      name,
      description: description || null,
      price_per_night: price,
      total_rooms: totalRooms,
      max_guests_per_room: maxGuests,
    })

  if (error) {
    if (error.code === "23505") {
      return {
        error: "A room type with this name already exists.",
      }
    }

    console.error("createRoomType failed:", error.message)

    return {
      error: "Unable to add this room type. Please try again.",
    }
  }

  // 7. Refresh the management page
  revalidatePath(`/host/listings/${listingId}/rooms`)

  return {
    success: "Room type added successfully.",
  }
}


export async function updateRoomType(
  listingId: string,
  roomTypeId: string,
  _prevState: RoomTypeState,
  formData: FormData
): Promise<RoomTypeState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Please log in again." }
  }

  // Verify property ownership
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .eq("host_id", user.id)
    .eq("listing_type", "stay")
    .maybeSingle()

  if (!listing) {
    return { error: "You cannot manage rooms for this property." }
  }

  const name = String(formData.get("name") ?? "").trim()
  const description = String(
    formData.get("description") ?? ""
  ).trim()

  const rawPrice = String(formData.get("price_per_night") ?? "")
  const price = Number(rawPrice)

  if (!name || name.length > 100) {
    return { error: "Enter a valid room type name." }
  }

  if (
    rawPrice.trim() === "" ||
    !Number.isSafeInteger(price) ||
    price < 0 ||
    price > 2147483647
  ) {
    return { error: "Enter a valid nightly price." }
  }

  if (description.length > 2000) {
    return { error: "Description is too long." }
  }

  const { data, error } = await supabase
    .from("stay_room_types")
    .update({
      name,
      description: description || null,
      price_per_night: price,
    })
    .eq("id", roomTypeId)
    .eq("listing_id", listingId)
    .select("id")
    .maybeSingle()

  if (error) {
    if (error.code === "23505") {
      return {
        error: "Another room category already has this name.",
      }
    }

    console.error("updateRoomType failed:", error.message)
    return { error: "Unable to update room details." }
  }

  if (!data) {
    return { error: "Room type not found or access denied." }
  }

  revalidatePath(`/host/listings/${listingId}/rooms`)

  return { success: "Room details updated successfully." }
}

export async function setRoomTypeActive(
  listingId: string,
  roomTypeId: string,
  active: boolean,
  _prevState: RoomTypeState,
  _formData: FormData
): Promise<RoomTypeState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Please log in again." }
  }

  // Verify the user is a host.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "host") {
    return { error: "Only hosts can manage rooms." }
  }

  // Verify the property belongs to this host.
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .eq("host_id", user.id)
    .eq("listing_type", "stay")
    .maybeSingle()

  if (!listing) {
    return {
      error: "You cannot manage rooms for this property.",
    }
  }

  // Change only the requested room type.
  const { data: updated, error } = await supabase
    .from("stay_room_types")
    .update({ is_active: active })
    .eq("id", roomTypeId)
    .eq("listing_id", listingId)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("setRoomTypeActive failed:", error.message)
    return { error: "Unable to update room availability." }
  }

  if (!updated) {
    return { error: "Room type not found or access denied." }
  }

  revalidatePath(`/host/listings/${listingId}/rooms`)

  return {
    success: active
      ? "Room type activated successfully."
      : "Room type deactivated successfully.",
  }
}

export async function updateRoomInventory(
  listingId: string,
  roomTypeId: string,
  _prevState: RoomTypeState,
  formData: FormData
): Promise<RoomTypeState> {
  const supabase = await createClient()

  // 1. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Please log in again." }
  }

  // 2. Validate the requested quantity
  const rawRooms = formData.get("total_rooms")

  if (typeof rawRooms !== "string" || !rawRooms.trim()) {
    return { error: "Please enter the number of rooms." }
  }

  const totalRooms = Number(rawRooms)

  if (
    !Number.isSafeInteger(totalRooms) ||
    totalRooms < 1 ||
    totalRooms > 10000
  ) {
    return {
      error: "Enter a whole number between 1 and 10,000.",
    }
  }

  // 3. Let the database verify ownership,
  // existing reservations and safe inventory limits.
  const { error } = await supabase.rpc(
    "update_stay_room_inventory",
    {
      p_room_type_id: roomTypeId,
      p_total_rooms: totalRooms,
    }
  )

  if (error) {
    if (error.message.includes("below_confirmed_reservations")) {
      return {
        error:
          "You cannot reduce the room quantity below the number already reserved for upcoming dates.",
      }
    }

    if (error.message.includes("legacy_booking_requires_review")) {
      return {
        error:
          "This property has existing confirmed bookings that need review before its inventory can be reduced.",
      }
    }

    if (
      error.message.includes("not_your_property") ||
      error.message.includes("not_a_host")
    ) {
      return {
        error: "You are not authorized to manage this property.",
      }
    }

    if (error.message.includes("room_type_not_found")) {
      return {
        error: "This room category could not be found.",
      }
    }

    console.error("updateRoomInventory failed:", error.message)

    return {
      error: "Unable to update room inventory. Please try again.",
    }
  }

  // 4. Refresh the host's room-management page
  revalidatePath(`/host/listings/${listingId}/rooms`)

  return {
    success: `Room inventory updated to ${totalRooms}.`,
  }
}
