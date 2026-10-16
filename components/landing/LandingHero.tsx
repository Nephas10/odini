
import Link from "next/link"

type Props = {
  isLoggedIn: boolean
}

export default function LandingHero({ isLoggedIn }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#7A1F2B] text-white">

      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-white/5" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">

        <div className="max-w-3xl">

          {/* Tag */}
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/90">
            Discover Zambia with Odini
          </span>

          {/* Heading */}
          <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
            Discover places.
            <br />
            Experience more.
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            Discover unique stays, exciting events and memorable activities
            across Zambia. Find your next experience with Odini.
          </p>

          {/* Actions */}
          <div className="mt-9 flex flex-wrap gap-4">

            <a
              href="#explore"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#7A1F2B] transition hover:bg-gray-100"
            >
              Explore Experiences
            </a>

            <Link
              href={isLoggedIn ? "/user" : "/auth/signup"}
              className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {isLoggedIn ? "Go to Explore" : "Join Odini"}
            </Link>

          </div>

        </div>
      </div>

    </section>
  )
}
