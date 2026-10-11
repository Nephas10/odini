import { createClient } from "@/lib/supabase/server"
import FYPFeed from "./FYPFeed"

export default async function FYPPage() {
  const supabase = await createClient()

  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      listing_type,
      price,
      location,
      image_url
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("FYP listings error:", error)

    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p className="text-white/60">
          Unable to load listings.
        </p>
      </div>
    )
  }

  return <FYPFeed listings={listings ?? []} />
}