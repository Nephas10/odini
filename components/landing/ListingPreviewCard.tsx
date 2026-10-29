
import Link from "next/link"
import {
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Compass,
  MapPin,
  Mountain,
} from "lucide-react"

export type ListingPreview = {
  id: string
  title: string
  description: string | null
  listing_type: string
  price: number | null
  location: string | null
  image_url: string | null
}

type Props = {
  listing: ListingPreview
}

// Category-specific styling
const CATEGORY_CONFIG = {
  stay: {
    label: "Stay",
    icon: BedDouble,
    color: "text-[#FF9AAF]",
    background: "bg-[#e8365d]/15",
  },
  event: {
    label: "Event",
    icon: CalendarDays,
    color: "text-[#E8BD70]",
    background: "bg-[#D4A64A]/15",
  },
  activity: {
    label: "Activity",
    icon: Mountain,
    color: "text-[#80D5B3]",
    background: "bg-emerald-500/15",
  },
  service: {
    label: "Service",
    icon: Compass,
    color: "text-[#A5B4FC]",
    background: "bg-indigo-500/15",
  },
}

function formatPrice(price: number | null) {
  if (price === null) {
    return "On request"
  }

  return `K${price.toLocaleString("en-ZM")}`
}

export default function ListingPreviewCard({
  listing,
}: Props) {
  const category =
    CATEGORY_CONFIG[
      listing.listing_type as keyof typeof CATEGORY_CONFIG
    ]

  const Icon = category?.icon ?? Compass

  return (
    <Link
      href={`/listing/${listing.id}`}
      aria-label={`View details for ${listing.title}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#302A2E] bg-[#1C1A1D] shadow-md shadow-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e8365d]/50 hover:shadow-xl hover:shadow-[#7A1F2B]/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e8365d]"
    >
      {/* Listing image */}
      <div className="relative h-56 shrink-0 overflow-hidden bg-[#30262B] sm:h-60">

        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#392029] to-[#1C1A1D]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Compass
                size={28}
                className="text-[#FF8CA5]/70"
              />
            </div>

            <span className="text-xs font-medium text-white/40">
              Photo coming soon
            </span>
          </div>
        )}

        {/* Image gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" />

        {/* Category badge */}
        <div
          className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 backdrop-blur-md ${
            category?.background ?? "bg-black/65"
          }`}
        >
          <Icon
            size={15}
            className={category?.color ?? "text-white"}
          />

          <span
            className={`text-xs font-bold ${
              category?.color ?? "text-white"
            }`}
          >
            {category?.label ?? listing.listing_type}
          </span>
        </div>

        {/* Corner arrow */}
        <div className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-[#e8365d]">
          <ArrowUpRight size={18} />
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">

        {/* Title */}
        <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-[#FF8CA5] sm:text-xl">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-white/55">
          {listing.description ||
            "Discover more about this experience and what it has to offer on Odini."}
        </p>

        {/* Location */}
        <div className="mt-4 flex items-start gap-2 text-sm text-white/65">
          <MapPin
            size={16}
            className="mt-0.5 shrink-0 text-[#e8365d]"
          />

          <span className="line-clamp-1">
            {listing.location || "Location unavailable"}
          </span>
        </div>

        {/* Footer anchored at bottom */}
        <div className="mt-auto pt-5">

          <div className="h-px bg-white/10" />

          <div className="flex items-end justify-between gap-3 pt-4">

            {/* Price */}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
                Listed price
              </p>

              <p className="mt-1 text-xl font-black tracking-tight text-white">
                {formatPrice(listing.price)}
              </p>
            </div>

            {/* View details */}
            <div className="flex shrink-0 items-center gap-1.5 pb-1 text-xs font-bold text-[#FF8CA5] sm:text-sm">
              <span>View details</span>

              <ArrowUpRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>

          </div>
        </div>
      </div>
    </Link>
  )
}
