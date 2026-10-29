
import Link from "next/link"
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Compass,
  MapPin,
  Mountain,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

type Props = {
  isLoggedIn: boolean
}

const CATEGORIES = [
  {
    title: "Unique stays",
    description: "Find your next place to stay.",
    icon: BedDouble,
    gradient: "from-[#71313F] to-[#321C26]",
  },
  {
    title: "Exciting events",
    description: "Discover what's happening.",
    icon: CalendarDays,
    gradient: "from-[#643D30] to-[#30221F]",
  },
  {
    title: "Local activities",
    description: "Make your next memory.",
    icon: Mountain,
    gradient: "from-[#344D47] to-[#1A2B2A]",
  },
]

export default function LandingHero({
  isLoggedIn,
}: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-[#121012] text-white">

      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(122,31,43,0.35),transparent_55%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_90%,rgba(232,54,93,0.09),transparent_50%)]" />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#7A1F2B]/20 blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8 lg:py-28">

        {/* Left: Hero content */}
        <div className="relative z-10 max-w-2xl">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8365d]/30 bg-[#e8365d]/10 px-4 py-2 text-xs font-semibold tracking-wide text-[#FF9AAF]">
            <Sparkles size={15} />
            Discover Zambia with Odini
          </div>

          {/* Main headline */}
          <h1 className="mt-7 text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-[64px]">
            Discover
            <span className="text-[#e8365d]">
              {" "}places.
            </span>

            <br />

            Experience
            <span className="text-[#FF8CA5]">
              {" "}more.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-base leading-8 text-white/60 sm:text-lg">
            Find unique stays, exciting events and
            memorable activities across Zambia.
            Explore what interests you and book
            when you're ready.
          </p>

          {/* Main CTA */}
          <div className="mt-9 flex flex-wrap items-center gap-3">

            <Link
              href="/explore"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#e8365d] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e8365d]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#d02d50]"
            >
              Explore experiences

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href={isLoggedIn ? "/user/dashboard" : "/auth/signup"}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
            >
              {isLoggedIn
                ? "My dashboard"
                : "Join Odini"}
            </Link>
          </div>

          {/* Trust / value message */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6">

            <div className="flex items-center gap-2 text-xs text-white/50 sm:text-sm">
              <Compass
                size={17}
                className="text-[#FF8CA5]"
              />
              Explore freely
            </div>

            <div className="flex items-center gap-2 text-xs text-white/50 sm:text-sm">
              <ShieldCheck
                size={17}
                className="text-[#FF8CA5]"
              />
              Sign in when booking
            </div>

            <div className="flex items-center gap-2 text-xs text-white/50 sm:text-sm">
              <MapPin
                size={17}
                className="text-[#FF8CA5]"
              />
              Experiences in Zambia
            </div>
          </div>

        </div>

        {/* Right: Category showcase */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">

          {/* Outer frame */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-5">

            {/* Showcase header */}
            <div className="flex items-center justify-between gap-3 px-1 pb-5">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF8CA5]">
                  Made for discovery
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Something for everyone.
                </h2>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e8365d]/20 bg-[#e8365d]/10">
                <Compass
                  size={23}
                  className="text-[#FF8CA5]"
                />
              </div>

            </div>

            {/* Category cards */}
            <div className="space-y-3">

              {CATEGORIES.map((category) => {
                const Icon = category.icon

                return (
                  <div
                    key={category.title}
                    className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r ${category.gradient} p-5 transition duration-300 hover:border-white/25 sm:p-6`}
                  >
                    {/* Decorative circle */}
                    <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/10 bg-white/5" />

                    <div className="relative flex items-center gap-4">

                      {/* Icon */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                        <Icon
                          size={25}
                          className="text-white"
                        />
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-white sm:text-lg">
                          {category.title}
                        </h3>

                        <p className="mt-1 text-xs text-white/65 sm:text-sm">
                          {category.description}
                        </p>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer link */}
            <Link
              href="/explore"
              className="group mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-[#1C181B] px-4 py-4 text-sm font-semibold text-white transition hover:border-[#e8365d]/40 hover:bg-[#e8365d]/10"
            >
              Explore all experiences

              <ArrowRight
                size={18}
                className="text-[#FF8CA5] transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>

          {/* Decorative glow behind showcase */}
          <div className="pointer-events-none absolute -bottom-10 left-1/4 -z-10 h-40 w-1/2 rounded-full bg-[#e8365d]/20 blur-[80px]" />

        </div>

      </div>

      {/* Bottom separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e8365d]/40 to-transparent" />

    </section>
  )
}
