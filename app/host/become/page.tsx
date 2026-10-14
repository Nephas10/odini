import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, CalendarCheck, MessageCircle, Store } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import BecomeHostForm from "./BecomeHostForm"

const BENEFITS = [
  { icon: Store, title: "List for free", text: "Stays, events or activities, with photos and your own prices." },
  { icon: MessageCircle, title: "Bookings on WhatsApp", text: "Guests message you directly with their booking details." },
  { icon: CalendarCheck, title: "You stay in control", text: "Confirm, cancel and mark bookings paid from your host side." },
]

// Page only: checks who's visiting, then shows the form.
export default async function BecomeHostPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/host/become")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, firstname, phone_number, business_name")
    .eq("id", user.id)
    .maybeSingle()

  // Already a host: nothing to sign up for
  if (profile?.role === "host") redirect("/host")

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <Link
            href="/user/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#F7EDEF]/80 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
          <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl">Host on ODINI</h1>
          <p className="mt-2 max-w-xl text-[#F7EDEF]/90">
            Share your place, event or activity with people looking for things to do in Zambia.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-5">
        {/* Benefits */}
        <div className="mt-8 space-y-5 lg:col-span-2">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7EDEF] text-[#7A1F2B]">
                <Icon size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{title}</h2>
                <p className="mt-0.5 text-sm text-gray-500">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form, pulled up over the band on large screens */}
        <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100 sm:p-8 lg:col-span-3 lg:-mt-6">
          <h2 className="text-xl font-bold text-gray-900">Set up your host account</h2>
          <p className="mt-1 mb-6 text-sm text-gray-500">Takes less than a minute.</p>
          <BecomeHostForm
            defaultName={profile?.business_name ?? ""}
            defaultPhone={profile?.phone_number ?? ""}
          />
        </div>
      </div>
    </main>
  )
}