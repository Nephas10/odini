import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import ListingForm from "../_form/ListingForm"
import { createListing } from "../_form/action"

// Page only: header + the shared form, wired to "create".
// The (protected) layout has already checked this is a logged-in host.
export default async function NewListingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Link
            href="/host/listings"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#F7EDEF]/80 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to listings
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">Create a listing</h1>
          <p className="mt-2 text-[#F7EDEF]/90">
            Save it as a draft any time, and publish when it's ready for guests.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ListingForm userId={user!.id} action={createListing} />
      </div>
    </main>
  )
}