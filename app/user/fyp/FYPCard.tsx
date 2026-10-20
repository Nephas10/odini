"use client"

import { useState } from "react"
import Link from "next/link"
import { Bookmark, CalendarDays, MapPin, Share2, Sparkles } from "lucide-react"
import type { RankedListing } from "./ranking"

type Props = {
  listing: RankedListing
  isFirst?: boolean
}

const CATEGORY_BADGE_CLASS: Record<string, string> = {
  stay: "border-blue-500/30 bg-blue-500/20 text-blue-400",
  event: "border-[#e8365d]/30 bg-[#e8365d]/20 text-[#e8365d]",
  activity: "border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
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
// Long content can scroll without covering the actions or decorative hint.
export default function FYPCard({ listing, isFirst = false }: Props) {
  const [shareMessage, setShareMessage] = useState("")

  const isEvent = listing.listing_type === "event"
  const isSoldOut = isEvent && listing.available_slots === 0
  const categoryBadgeClass = Object.prototype.hasOwnProperty.call(CATEGORY_BADGE_CLASS, listing.listing_type)
    ? CATEGORY_BADGE_CLASS[listing.listing_type]
    : "border-white/30 bg-white/10 text-white"
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
    <article className="relative h-full w-full min-w-0 flex-shrink-0 snap-start snap-always overflow-hidden bg-black">
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
          <div className="flex h-full w-full items-center justify-center bg-black">
            <p className="text-sm text-white/40">Photo coming soon</p>
          </div>
        )}

        {/* Gradients keep the text readable on any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </div>

      {/* Full-width text; the details and actions reserve their own side-action lane. */}
      <div className="relative flex h-full min-w-0 flex-col overflow-y-auto pt-5 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] md:pl-[max(2.5rem,env(safe-area-inset-left,0px))] md:pr-[max(2.5rem,env(safe-area-inset-right,0px))]">
        <div className="mt-auto w-full min-w-0 max-w-lg shrink-0 md:max-w-[27rem]">
          {/* Type + reason */}
          <div className="flex flex-col items-start gap-2">
            <span className={`inline-flex items-center self-stretch rounded-full border px-2 py-0.5 text-[10px] font-normal [font-family:var(--odini-font-display,inherit)] uppercase tracking-widest ${categoryBadgeClass}`}>
              {listing.listing_type}
            </span>
            <span
              className={`inline-flex min-w-0 max-w-full items-start gap-1 rounded-full px-2 py-0.5 text-xs font-semibold break-words backdrop-blur-md ${
                isSoldOut ? "border border-white/30 bg-black/60 text-white" : "border border-[#e8365d]/30 bg-black/60 text-white"
              }`}
            >
              {!isSoldOut && <Sparkles size={12} className="shrink-0 text-[#e8365d]" />}
              {listing.reason}
            </span>
          </div>

          {/* Keep the prototype hierarchy; short screens retain access through scrolling. */}
          <h2 className="mt-3 break-words text-3xl font-normal [font-family:var(--odini-font-display,inherit)] leading-tight text-white md:text-4xl">
            {listing.title}
          </h2>

          {/* Description remains available on short screens. */}
          {listing.description && (
            <p className="mt-2 line-clamp-2 max-w-lg break-words text-sm leading-relaxed text-white/75">
              {listing.description}
            </p>
          )}

          <div className="relative mt-3 min-h-[104px] pr-16">
            {/* Details */}
            <div className="flex min-w-0 flex-wrap items-center gap-3 text-xs text-white/75">
              {listing.location && (
                <span className="flex min-w-0 max-w-full items-center gap-1.5">
                  <MapPin size={15} className="shrink-0 text-white/75" />
                  <span className="min-w-0 break-words">{listing.location}</span>
                </span>
              )}
              {isEvent && listing.event_time && (
                <span className="flex min-w-0 max-w-full items-center gap-1.5">
                  <CalendarDays size={15} className="shrink-0 text-white/75" />
                  {formatEventDate(listing.event_time)}
                </span>
              )}

              {/* Price */}
              <p className="min-w-0 break-words text-sm font-normal [font-family:var(--odini-font-display,inherit)] text-white">
                {listing.price != null ? `K${listing.price.toLocaleString("en-ZM")}` : "Price on request"}
                {listing.price != null && PRICE_UNIT[listing.listing_type] && (
                  <span className="ml-1 text-sm font-normal text-white/60">
                    {PRICE_UNIT[listing.listing_type]}
                  </span>
                )}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex flex-wrap gap-3">
              {isSoldOut ? (
                <span className="cursor-not-allowed rounded-full bg-white/20 px-5 py-3 text-sm font-semibold text-white/70">
                  Sold out
                </span>
              ) : (
                <Link
                  href={`${listingUrl}/book`}
                  className="inline-flex min-h-11 max-w-full items-center justify-center rounded-full bg-[#e8365d] px-5 py-2.5 text-center text-sm font-normal [font-family:var(--odini-font-display,inherit)] break-words text-black transition-colors hover:bg-[#d02d50] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8365d]"
                >
                  {BOOK_LABEL[listing.listing_type] ?? "Book now"}
                </Link>
              )}
              <Link
                href={listingUrl}
                className="inline-flex min-h-11 max-w-full items-center justify-center rounded-full border border-white/30 px-5 py-2.5 text-center text-sm font-normal [font-family:var(--odini-font-display,inherit)] break-words text-white transition-colors hover:border-white hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8365d]"
              >
                See more
              </Link>
            </div>
            {/* Side actions have a dedicated lane, clear of text and booking links. */}
            <div className="absolute right-0 bottom-0 flex flex-col items-center gap-4">
              {/* Save: not wired up yet */}
              <button
                type="button"
                aria-label="Save listing"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8365d]"
              >
                <Bookmark size={19} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share listing"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8365d]"
                >
                  <Share2 size={18} />
                </button>
                {shareMessage && (
                  <span className="absolute right-full top-1/2 mr-2 w-max max-w-[calc(100vw-6rem)] -translate-y-1/2 rounded-lg bg-black/80 px-3 py-2 text-xs break-words text-white">
                    {shareMessage}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative first-card hint, below the content and hidden from assistive technology. */}
      {isFirst && (
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 animate-bounce text-white/40 motion-reduce:animate-none">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </article>
  )
}