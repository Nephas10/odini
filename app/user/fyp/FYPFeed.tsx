"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, Compass } from "lucide-react"
import FYPCard from "./FYPCard"
import type { RankedListing } from "./ranking"

type Props = {
  listings: RankedListing[]
}

// Full-height swipe feed: one listing per screen, snapping as you scroll.
// Height = screen minus the sticky navbar (taller on mobile because of its second row).
const FEED_HEIGHT = "h-[calc(100dvh-108px)] md:h-[calc(100dvh-64px)]"

export default function FYPFeed({ listings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  function handleScroll() {
    const container = containerRef.current
    if (!container) return
    const index = Math.round(container.scrollTop / container.clientHeight)
    if (index !== current) setCurrent(index)
  }

  function goToNext() {
    const container = containerRef.current
    if (!container) return
    container.scrollTo({ top: (current + 1) * container.clientHeight, behavior: "smooth" })
  }

  if (listings.length === 0) {
    return (
      <div className={`flex ${FEED_HEIGHT} flex-col items-center justify-center bg-[#1A0609] px-6 text-center text-white`}>
        <Compass size={40} className="text-[#D4A64A]" />
        <p className="mt-4 text-lg font-semibold">Nothing in your feed yet</p>
        <p className="mt-1 text-sm text-white/60">New stays, events and activities will show up here.</p>
        <Link
          href="/user"
          className="mt-6 rounded-full bg-[#D4A64A] px-5 py-2.5 text-sm font-semibold text-[#3D0F15]"
        >
          Explore listings
        </Link>
      </div>
    )
  }

  const isLast = current >= listings.length - 1

  return (
    <div className={`relative ${FEED_HEIGHT} w-full bg-[#1A0609]`}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {listings.map((listing, index) => (
          <FYPCard key={listing.id} listing={listing} isFirst={index === 0} />
        ))}
      </div>

      {/* Position counter */}
      <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {current + 1} / {listings.length}
      </div>

      {/* Next button (desktop, where swiping isn't natural) */}
      {!isLast && (
        <button
          onClick={goToNext}
          aria-label="Next listing"
          className="absolute bottom-6 right-6 hidden h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 md:flex"
        >
          <ChevronDown size={22} />
        </button>
      )}
    </div>
  )
}