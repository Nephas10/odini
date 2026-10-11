"use client"

import { useRef } from "react"
import FYPCard from "./FYPCard"

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
  listings: Listing[]
}

export default function FYPFeed({ listings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  function handleScroll() {
    if (!containerRef.current) return

    const container = containerRef.current

    const currentIndex = Math.round(
      container.scrollTop / container.clientHeight
    )

    console.log("Current FYP listing:", currentIndex)
  }

  if (listings.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p className="text-white/60">
          No listings available yet.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-screen w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
    >
      {listings.map((listing, index) => (
        <FYPCard
          key={listing.id}
          listing={listing}
          isFirst={index === 0}
        />
      ))}
    </div>
  )
}