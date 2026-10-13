"use client"

import { useState } from "react"
import Link from "next/link"
import { Bookmark, CalendarDays, MapPin, Share2, Sparkles } from "lucide-react"
import type { RankedListing } from "./ranking"

type Props = {
  listing: RankedListing
  isFirst?: boolean
}

const PRICE_UNIT: Record<string, string> = {
  stay: "/ night",
  event: "/ ticket",
  activity: "/ person",
}

const BOOK_LABEL: Record<string, string> = {
  stay: "Book stay",
  event: "Get tickets",
  activity: "Book now",
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lusaka",
  })
}

// One full-height listing in the For You feed.
// Fits phones (text leaves room for the side buttons) and short screens (less text shown).
export default function FYPCard({ listing, isFirst = false }: Props) {
  const [shareMessage, setShareMessage] = useState("")

  const isEvent = listing.listing_type === "event"
  const isSoldOut = isEvent && listing.available_slots === 0
  const listingUrl = `/user/listings/${listing.id}`

  async function handleShare() {
    const url = `${window.location.origin}${listingUrl}?utm_source=fyp`
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareMessage("Link copied!")
        setTimeout(() => setShareMessage(""), 2000)
      }
    } catch {
      // User cancelled sharing
    }
  }

  return (
    <article className="relative h-full w-full flex-shrink-0 snap-start overflow-hidden bg-[#1A0609]">
      {/* Background image */}
      <div className="absolute inset-0">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            loading={isFirst ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#7A1F2B] to-[#1A0609]">
            <p className="text-sm text-white/40">Photo coming soon</p>
          </div>
        )}

        {/* Gradients keep the text readable on any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content: right padding on phones leaves a lane for the side buttons */}
      <div className="relative flex h-full flex-col justify-end px-5 pb-[calc(3.5rem+env(safe-area-inset-bottom))] pr-20 sm:px-8 sm:pr-24 md:px-12 md:pb-16 [@media(max-height:420px)]:pb-4">
        <div className="max-w-xl">
          {/* Type + reason */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#7A1F2B] px-3 py-1 text-xs font-semibold capitalize text-white">
              {listing.listing_type}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${
                isSoldOut ? "bg-red-600/90 text-white" : "bg-[#D4A64A]/90 text-[#3D0F15]"
              }`}
            >
              {!isSoldOut && <Sparkles size={12} />}
              {listing.reason}
            </span>
          </div>

          {/* Title (shorter on short screens) */}
          <h2 className="mt-3 line-clamp-3 [@media(max-height:420px)]:mt-1.5 [@media(max-height:420px)]:line-clamp-1 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl [@media(max-height:600px)]:line-clamp-2 [@media(max-height:600px)]:text-xl">
            {listing.title}
          </h2>

          {/* Description (hidden on very short screens) */}
          {listing.description && (
            <p className="mt-2 line-clamp-2 max-w-lg text-sm leading-relaxed text-white/75 sm:line-clamp-3 md:text-base [@media(max-height:600px)]:hidden">
              {listing.description}
            </p>
          )}

          {/* Details */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/75 sm:text-sm [@media(max-height:420px)]:hidden">
            {isEvent && listing.event_time && (
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} className="text-[#D4A64A]" />
                {formatEventDate(listing.event_time)}
              </span>
            )}
            {listing.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-[#D4A64A]" />
                <span className="line-clamp-1">{listing.location}</span>
              </span>
            )}
          </div>

          {/* Price */}
          <p className="mt-2 text-lg font-bold text-white sm:text-xl">
            {listing.price != null ? `K${listing.price.toLocaleString("en-ZM")}` : "Price on request"}
            {listing.price != null && PRICE_UNIT[listing.listing_type] && (
              <span className="ml-1 text-sm font-medium text-white/60">
                {PRICE_UNIT[listing.listing_type]}
              </span>
            )}
          </p>

          {/* Buttons */}
          <div className="mt-4 flex flex-wrap gap-3 [@media(max-height:420px)]:mt-2 [&>*]:[@media(max-height:420px)]:py-2">
            {isSoldOut ? (
              <span className="cursor-not-allowed rounded-full bg-white/20 px-5 py-3 text-sm font-semibold text-white/70">
                Sold out
              </span>
            ) : (
              <Link
                href={`${listingUrl}/book`}
                className="rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#5E1721]"
              >
                {BOOK_LABEL[listing.listing_type] ?? "Book now"}
              </Link>
            )}
            <Link
              href={listingUrl}
              className="rounded-full border border-white/40 px-5 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              See more
            </Link>
          </div>
        </div>
      </div>

      {/* Side actions, in the lane kept free on the right */}
      <div className="absolute bottom-[calc(3.5rem+env(safe-area-inset-bottom))] right-4 flex flex-col items-center gap-4 sm:right-6 md:bottom-24 md:right-8 [@media(max-height:420px)]:bottom-4 [@media(max-height:420px)]:gap-2">
        {/* Save: not wired up yet */}
        <button
          type="button"
          aria-label="Save listing"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
        >
          <Bookmark size={19} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share listing"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <Share2 size={18} />
          </button>
          {shareMessage && (
            <span className="absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/80 px-3 py-2 text-xs text-white">
              {shareMessage}
            </span>
          )}
        </div>
      </div>

      {/* Scroll hint, first card only (phones; desktop has the next button) */}
      {isFirst && (
        <div className="pointer-events-none absolute bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center text-white/50 md:hidden [@media(max-height:420px)]:hidden">
          <span className="text-[10px] uppercase tracking-wider">Swipe up</span>
          <span className="animate-bounce">↑</span>
        </div>
      )}
    </article>
  )
}