
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Mountain,
} from "lucide-react"

const CATEGORIES = [
  {
    title: "Stays",
    description:
      "Discover comfortable accommodation, weekend getaways and places worth staying.",
    label: "Find your perfect stay",
    href: "/explore?category=stay",
    icon: BedDouble,
    background: "from-[#56313F] to-[#241B24]",
    iconColor: "text-[#FF9AAF]",
    iconBackground: "bg-[#e8365d]/15",
  },
  {
    title: "Events",
    description:
      "Explore exciting competitions, social gatherings and memorable events.",
    label: "See what's happening",
    href: "/explore?category=event",
    icon: CalendarDays,
    background: "from-[#64402F] to-[#2D211F]",
    iconColor: "text-[#F3C77C]",
    iconBackground: "bg-[#D4A64A]/15",
  },
  {
    title: "Activities",
    description:
      "Find adventures, local attractions and new experiences to enjoy.",
    label: "Discover activities",
    href: "/explore?category=activity",
    icon: Mountain,
    background: "from-[#35564C] to-[#1E2D29]",
    iconColor: "text-[#8DE0BA]",
    iconBackground: "bg-emerald-400/15",
  },
]

export default function LandingCategories() {
  return (
    <section className="relative bg-[#F8F5F3] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Section heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <span className="inline-block rounded-full bg-[#7A1F2B]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#7A1F2B]">
              Explore your way
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-[#20191C] sm:text-4xl">
              What are you{" "}
              <span className="text-[#7A1F2B]">
                looking for?
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              From relaxing stays to exciting events and
              unforgettable adventures, discover experiences
              that match your interests.
            </p>
          </div>

          <Link
            href="/explore"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#7A1F2B] transition hover:text-[#e8365d]"
          >
            Browse everything

            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

        </div>

        {/* Category cards */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">

          {CATEGORIES.map((category) => {
            const Icon = category.icon

            return (
              <Link
                key={category.title}
                href={category.href}
                className={`group relative flex min-h-[290px] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br ${category.background} p-7 text-white shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e8365d] sm:p-8`}
              >

                {/* Decorative background */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10 bg-white/5 transition-transform duration-500 group-hover:scale-125" />

                <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 translate-x-12 translate-y-12 rounded-full border border-white/10" />

                {/* Top icons */}
                <div className="relative flex items-start justify-between">

                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 ${category.iconBackground}`}
                  >
                    <Icon
                      size={30}
                      strokeWidth={1.7}
                      className={category.iconColor}
                    />
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 transition duration-300 group-hover:rotate-45 group-hover:bg-white/20">
                    <ArrowUpRight size={19} />
                  </div>

                </div>

                {/* Category information */}
                <div className="relative mt-auto pt-10">

                  <h3 className="text-2xl font-black tracking-tight">
                    {category.title}
                  </h3>

                  <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">
                    {category.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5 text-sm font-bold">

                    <span>{category.label}</span>

                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1.5"
                    />

                  </div>

                </div>

              </Link>
            )
          })}

        </div>

        {/* Bottom message */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Explore freely. Create an account when you're
          ready to book your experience.
        </p>

      </div>
    </section>
  )
}
