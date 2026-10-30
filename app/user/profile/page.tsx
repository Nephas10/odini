
import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowRight,
  CalendarCheck,
  Heart,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated visitors to Login.
  // Preserve profile as the intended destination.
  if (!user) {
    redirect(
      "/auth/login?next=%2Fuser%2Fprofile"
    )
  }

  // Fetch only the information we already use.
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("firstname, phone_number")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error(
      "Profile load error:",
      error.message
    )

    return (
      <main className="min-h-screen bg-[#121012] px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-500/20 bg-[#1C1A1D] p-8">
          <h1 className="text-xl font-bold">
            Unable to load profile
          </h1>

          <p className="mt-3 text-sm text-white/50">
            Something went wrong while loading your
            information. Please try again later.
          </p>
        </div>
      </main>
    )
  }

  // Fallbacks if the profile is incomplete.
  const displayName =
    profile?.firstname?.trim() ||
    "Odini member"

  const email =
    user.email || "Email unavailable"

  const phone =
    profile?.phone_number?.trim() ||
    "Not provided"

  // Generate avatar initial from the name.
  const avatarInitial =
    displayName.charAt(0).toUpperCase()

  return (
    <main className="min-h-screen bg-[#121012] px-4 py-10 text-white sm:px-6 sm:py-14">

      <div className="mx-auto max-w-5xl">

        {/* Page header */}
        <div className="mb-10">

          <span className="inline-flex items-center rounded-full border border-[#e8365d]/20 bg-[#e8365d]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#FF8CA5]">
            My account
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/50 sm:text-base">
            View your personal information and manage
            your Odini experiences.
          </p>

        </div>

        {/* Profile card */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#1C1A1D] shadow-xl shadow-black/10">

          {/* Profile banner */}
          <div className="relative h-28 overflow-hidden bg-gradient-to-r from-[#7A1F2B] via-[#52202F] to-[#2C1A23] sm:h-36">

            {/* Background circles */}
            <div className="pointer-events-none absolute -right-10 -top-20 h-60 w-60 rounded-full border border-white/10 bg-white/5" />

            <div className="pointer-events-none absolute left-1/3 top-10 h-40 w-40 rounded-full border border-white/10" />

          </div>

          <div className="px-6 pb-8 sm:px-8">

            {/* Avatar and identity */}
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">

              <div className="relative z-10 flex items-end gap-4">

                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-[#1C1A1D] bg-[#e8365d] text-3xl font-black text-white shadow-lg sm:h-24 sm:w-24">
                  {avatarInitial}
                </div>

                {/* Name */}
                <div className="pb-1">

                  <h2 className="max-w-xs break-words text-xl font-bold text-white sm:text-2xl">
                    {displayName}
                  </h2>

                  <p className="mt-1 text-xs font-medium text-white/45 sm:text-sm">
                    Odini member
                  </p>

                </div>
              </div>

              <div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#242024] px-4 py-2 text-xs font-semibold text-white/65">
                <ShieldCheck
                  size={15}
                  className="text-[#FF8CA5]"
                />

                Your account
              </div>

            </div>

            {/* Personal information */}
            <div className="mt-10 border-t border-white/10 pt-8">

              <div className="mb-6 flex items-center gap-2">

                <UserRound
                  size={20}
                  className="text-[#FF8CA5]"
                />

                <h3 className="text-lg font-bold">
                  Personal information
                </h3>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* Full name */}
                <div className="rounded-2xl border border-white/10 bg-[#242024] p-5">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                    <UserRound size={15} />
                    Name
                  </div>

                  <p className="mt-3 break-words text-base font-semibold text-white">
                    {displayName}
                  </p>

                </div>

                {/* Email */}
                <div className="rounded-2xl border border-white/10 bg-[#242024] p-5">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                    <Mail size={15} />
                    Email address
                  </div>

                  <p className="mt-3 break-all text-base font-semibold text-white">
                    {email}
                  </p>

                </div>

                {/* Phone */}
                <div className="rounded-2xl border border-white/10 bg-[#242024] p-5">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                    <Phone size={15} />
                    WhatsApp number
                  </div>

                  <p className="mt-3 break-words text-base font-semibold text-white">
                    {phone}
                  </p>

                </div>

                {/* Membership */}
                <div className="rounded-2xl border border-white/10 bg-[#242024] p-5">

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                    <ShieldCheck size={15} />
                    Membership
                  </div>

                  <p className="mt-3 text-base font-semibold text-white">
                    Odini member
                  </p>

                </div>

              </div>

            </div>

            {/* Profile management notice */}
            <div className="mt-7 rounded-xl border border-[#e8365d]/15 bg-[#e8365d]/5 px-5 py-4">
              <p className="text-sm leading-6 text-white/55">
                Your profile information is linked to
                your Odini account. Profile editing
                will be available here.
              </p>
            </div>

          </div>
        </section>

        {/* Account shortcuts */}
        <div className="mt-10">

          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Your Odini
            </h2>

            <p className="mt-2 text-sm text-white/45">
              Quickly access your bookings and
              saved experiences.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Bookings */}
            <Link
              href="/user/bookings"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#1C1A1D] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#e8365d]/40"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8365d]/10">
                  <CalendarCheck
                    size={23}
                    className="text-[#FF8CA5]"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    My Bookings
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-white/45">
                    View your reservations
                  </p>
                </div>
              </div>

              <ArrowRight
                size={19}
                className="shrink-0 text-[#FF8CA5] transition-transform group-hover:translate-x-1"
              />

            </Link>

            {/* Saved */}
            <Link
              href="/user/saved"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#1C1A1D] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#e8365d]/40"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8365d]/10">
                  <Heart
                    size={23}
                    className="text-[#FF8CA5]"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    Saved Experiences
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Discover your favorites
                  </p>
                </div>
              </div>

              <ArrowRight
                size={19}
                className="shrink-0 text-[#FF8CA5] transition-transform group-hover:translate-x-1"
              />

            </Link>

          </div>

        </div>

        {/* Back to Explore */}
        <div className="mt-10 text-center">

          <Link
            href="/user"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF8CA5] transition hover:text-white"
          >
            Continue exploring

            <ArrowRight size={17} />
          </Link>

        </div>

      </div>
    </main>
  )
}
