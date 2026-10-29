
import Link from "next/link"
import Image from "next/image"

import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Heart,
  MapPin,
} from "lucide-react"

// Footer navigation
const DISCOVER_LINKS = [
  {
    label: "Explore all",
    href: "/explore",
  },
  {
    label: "Stays",
    href: "/explore?category=stay",
  },
  {
    label: "Events",
    href: "/explore?category=event",
  },
  {
    label: "Activities",
    href: "/explore?category=activity",
  },
]

const ACCOUNT_LINKS = [
  {
    label: "Log in",
    href: "/auth/login",
  },
  {
    label: "Create account",
    href: "/auth/signup",
  },
  {
    label: "My bookings",
    href: "/user/bookings",
  },
]

const HOST_LINKS = [
  {
    label: "Become a host",
    href: "/host/become",
  },
  {
    label: "Host dashboard",
    href: "/host",
  },
]

export default function LandingFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#121012] text-white">

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#7A1F2B]/15 blur-[100px]" />

      {/* Top separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#e8365d]/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 sm:pt-20 lg:px-8">

        {/* Main footer grid */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">

          {/* Brand section */}
          <div className="max-w-sm">

            <Link
              href="/"
              aria-label="Odini homepage"
              className="group inline-flex items-center gap-3"
            >
              {/* Logo */}
              <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-[#7A1F2B]">
                <Image
                  src="/odini.jpeg"
                  alt="Odini logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              <span className="text-3xl font-black tracking-tight text-white transition group-hover:text-[#FF8CA5]">
                odini
                <span className="text-[#e8365d]">.</span>
              </span>
            </Link>

            <h2 className="mt-6 text-lg font-bold leading-snug text-white">
              Discover places.
              <br />
              <span className="text-[#FF8CA5]">
                Experience more.
              </span>
            </h2>

            <p className="mt-4 max-w-xs text-sm leading-7 text-white/50">
              Discover unique stays, exciting events
              and memorable activities across Zambia.
              Find experiences worth sharing with Odini.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <MapPin
                size={15}
                className="text-[#e8365d]"
              />

              <span className="text-xs font-medium text-white/65">
                Discover Zambia
              </span>
            </div>

          </div>

          {/* Discover links */}
          <div>
            <h3 className="text-sm font-bold tracking-wide text-white">
              Discover
            </h3>

            <ul className="mt-6 space-y-4">
              {DISCOVER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:translate-x-1 hover:text-[#FF8CA5]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="text-sm font-bold tracking-wide text-white">
              Your account
            </h3>

            <ul className="mt-6 space-y-4">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:translate-x-1 hover:text-[#FF8CA5]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Host links */}
          <div>
            <h3 className="text-sm font-bold tracking-wide text-white">
              For hosts
            </h3>

            <p className="mt-6 text-sm leading-6 text-white/50">
              Have a place, event or activity you'd
              like people to discover?
            </p>

            <ul className="mt-5 space-y-4">
              {HOST_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-[#FF8CA5]"
                  >
                    {link.label}

                    <ArrowUpRight
                      size={14}
                      className="text-[#e8365d]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Discover CTA */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-gradient-to-r from-[#351923] via-[#28171E] to-[#1B171B] p-6 sm:p-8">

          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

            <div className="flex items-start gap-4">

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#e8365d]/20 bg-[#e8365d]/10 sm:flex">
                <Compass
                  size={23}
                  className="text-[#FF8CA5]"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Your next experience starts here.
                </h3>

                <p className="mt-2 max-w-lg text-sm leading-6 text-white/55">
                  Explore what's happening, discover new
                  places and find something worth experiencing.
                </p>
              </div>

            </div>

            <Link
              href="/explore"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#e8365d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d02d50]"
            >
              Start exploring

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>

        </div>

        {/* Bottom footer */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center">

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Odini.
            All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
            <span>Made for discovery in Zambia</span>

            <Heart
              size={14}
              className="fill-[#e8365d] text-[#e8365d]"
            />
          </div>

        </div>

      </div>
    </footer>
  )
}
