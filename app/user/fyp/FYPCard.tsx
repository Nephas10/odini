"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Share2, Bookmark } from "lucide-react"

type Listing = {
  id: string
  title: string
  description: string | null
  listing_type: string
  price: number | null
  location: string | null
  image_url: string | null
}

type Props = {
  listing: Listing
  isFirst?: boolean
}

export default function FYPCard({
  listing,
  isFirst = false,
}: Props) {
  const router = useRouter()

  const [shareMessage, setShareMessage] = useState("")

  async function handleShare() {
    const url = `${window.location.origin}/user/listings/${listing.id}?utm_source=fyp`

    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)

        setShareMessage("Link copied!")

        setTimeout(() => {
          setShareMessage("")
        }, 2000)
      }
    } catch {
      // User cancelled sharing
    }
  }

  function handleView() {
    router.push(`/user/listings/${listing.id}`)
  }

  const buttonText =
    listing.listing_type === "event"
      ? "Get Tickets"
      : "View Experience"

  return (
    <article className="relative h-full w-full flex-shrink-0 snap-start overflow-hidden bg-black">

      {/* Background image */}
      <div className="absolute inset-0">

        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-900">
            <p className="text-sm text-white/40">
              No image available
            </p>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Left gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

      </div>

      {/* Content */}
      <div className="relative flex h-full">

        <div className="flex max-w-xl flex-1 flex-col justify-end px-6 pb-12 md:px-10 md:pb-16">

          {/* Category */}
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-white backdrop-blur-md">
            {listing.listing_type}
          </span>

          {/* Title */}
          <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl">
            {listing.title}
          </h2>

          {/* Description */}
          {listing.description && (
            <p className="mt-3 line-clamp-3 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">
              {listing.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-4">

            {listing.location && (
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <MapPin size={15} />
                <span className="line-clamp-1">
                  {listing.location}
                </span>
              </div>
            )}

            <span className="text-sm font-bold text-white">
              {listing.price != null
                ? `K${listing.price.toLocaleString()}`
                : "Price on request"}
            </span>

          </div>

          {/* Buttons */}
          <div className="mt-5 flex gap-3">

            <button
              type="button"
              onClick={handleView}
              className="rounded-full bg-[#e8365d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d02d50]"
            >
              {buttonText}
            </button>

            <button
              type="button"
              onClick={handleView}
              className="rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              See More
            </button>

          </div>

        </div>

        {/* Right actions */}
        <div className="absolute bottom-20 right-4 flex flex-col items-center gap-4 md:right-8">

          {/* Save */}
          <button
            type="button"
            aria-label="Save listing"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-black/80"
          >
            <Bookmark size={19} />
          </button>

          {/* Share */}
          <div className="relative">

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share listing"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-black/80"
            >
              <Share2 size={18} />
            </button>

            {shareMessage && (
              <span className="absolute right-0 top-14 whitespace-nowrap rounded-lg bg-black/80 px-3 py-2 text-xs text-white">
                {shareMessage}
              </span>
            )}

          </div>

        </div>

      </div>

      {/* Scroll indicator */}
      {isFirst && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center text-white/50">
          <span className="text-[10px]">
            Scroll
          </span>

          <span className="mt-1 animate-bounce">
            ↓
          </span>
        </div>
      )}

    </article>
  )
}