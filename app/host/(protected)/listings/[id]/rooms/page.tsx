
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, BedDouble } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import RoomTypeForm from "./RoomTypeForm"
import EditRoomTypeForm from "./EditRoomTypeForm"
import RoomStatusControl from "./RoomStatusControl"
import RoomInventoryForm from "./RoomInventoryForm"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ManageRoomsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      `/auth/login?next=${encodeURIComponent(
        `/host/listings/${id}/rooms`
      )}`
    )
  }

  // Load only a stay listing owned by this host
  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, listing_type")
    .eq("id", id)
    .eq("host_id", user.id)
    .eq("listing_type", "stay")
    .maybeSingle()

  if (!listing) notFound()

  // Load this property's room categories
  const { data: roomTypes, error } = await supabase
    .from("stay_room_types")
    .select(`
      id,
      name,
      description,
      price_per_night,
      total_rooms,
      max_guests_per_room,
      is_active
    `)
    .eq("listing_id", id)
    .order("created_at", { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Link
            href={`/host/listings/${id}/edit`}
            className="inline-flex items-center gap-2 text-sm
              font-medium text-white/80 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to listing editor
          </Link>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-white/70">
            Room management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            {listing.title}
          </h1>

          <p className="mt-2 text-sm text-white/80">
            Manage room categories, prices, and inventory.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        {/* Existing room types */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Room types
            </h2>

            <span className="text-sm text-gray-500">
              {roomTypes?.length ?? 0} categories
            </span>
          </div>

          {error ? (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              Unable to load room types. Please refresh the page.
            </div>
          ) : !roomTypes || roomTypes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <BedDouble
                size={36}
                className="mx-auto text-[#7A1F2B]"
              />

              <h3 className="mt-3 font-semibold text-gray-900">
                No room types yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Add the first room category for this property.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {roomTypes.map((room) => (
                <div
                  key={room.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {room.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {room.total_rooms}{" "}
                        {room.total_rooms === 1 ? "room" : "rooms"}
                        {" · "}
                        Up to {room.max_guests_per_room} guests per room
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        room.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {room.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {room.description && (
                    <p className="mt-3 text-sm text-gray-600">
                      {room.description}
                    </p>
                  )}

                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-xl font-bold text-[#7A1F2B]">
                      K{room.price_per_night.toLocaleString("en-ZM")}
                      <span className="ml-1 text-sm font-normal text-gray-500">
                        / night
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-start gap-3 border-t border-gray-100 pt-4">
                    <EditRoomTypeForm
                      listingId={listing.id}
                      room={room}
                    />

                    <RoomStatusControl
                      listingId={listing.id}
                      room={room}
                    />

                    <RoomInventoryForm
                      listingId={listing.id}
                      room={room}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Create a new category */}
        <RoomTypeForm listingId={listing.id} />
      </div>
    </main>
  )
}
