
import Link from "next/link"

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

export default function ListingPreviewCard({ listing }: Props) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >

      {/* Listing Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100">

        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Listing photo coming soon
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold capitalize text-[#7A1F2B] shadow-sm">
          {listing.listing_type}
        </span>

      </div>

      {/* Card Content */}
      <div className="p-5">

        <h3 className="text-lg font-bold text-gray-900 transition group-hover:text-[#7A1F2B]">
          {listing.title}
        </h3>

        {listing.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
            {listing.description}
          </p>
        )}

        {/* Location and Price */}
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-gray-100 pt-4">

          <div>
            <p className="text-xs text-gray-400">
              Location
            </p>

            <p className="mt-1 text-sm font-medium text-gray-700">
              {listing.location || "Location unavailable"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">
              Price
            </p>

            <p className="mt-1 font-bold text-[#7A1F2B]">
              {listing.price != null
                ? `K${listing.price.toLocaleString()}`
                : "On request"}
            </p>
          </div>

        </div>

      </div>

    </Link>
  )
}
