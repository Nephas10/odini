
"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Images } from "lucide-react"

type Props = {
  title: string
  coverImage?: string | null
  photos?: string[] | null
  badge?: string
}

export default function ListingPhotoGallery({
  title,
  coverImage,
  photos,
  badge,
}: Props) {
  // Keep the cover photo first, then add any other photos.
  // Remove empty URLs and duplicates.
  const images = Array.from(
    new Set(
      [coverImage, ...(photos ?? [])].filter(
        (url): url is string =>
          typeof url === "string" && url.trim().length > 0
      )
    )
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  // Reset the gallery when a different listing is loaded.
  const imagesKey = images.join("|")

  useEffect(() => {
    setActiveIndex(0)
  }, [imagesKey])

  const nextPhoto = () => {
    if (images.length < 2) return
    setActiveIndex((current) => (current + 1) % images.length)
  }

  const previousPhoto = () => {
    if (images.length < 2) return
    setActiveIndex(
      (current) => (current - 1 + images.length) % images.length
    )
  }

  const handleTouchEnd = (endX: number) => {
    if (touchStartX.current === null) return

    const difference = touchStartX.current - endX
    touchStartX.current = null

    if (Math.abs(difference) < 50) return

    if (difference > 0) {
      nextPhoto()
    } else {
      previousPhoto()
    }
  }

  const activePhoto = images[activeIndex] ?? images[0]

  return (
    <div className="space-y-3">
      {/* Main photo */}
      <div
        className="group relative h-72 overflow-hidden rounded-2xl bg-[#F7EDEF] sm:h-96"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          const endX = event.changedTouches[0]?.clientX

          if (endX !== undefined) {
            handleTouchEnd(endX)
          }
        }}
        onTouchCancel={() => {
          touchStartX.current = null
        }}
      >
        {activePhoto ? (
          <img
            src={activePhoto}
            alt={`${title} - photo ${activeIndex + 1}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-[#7A1F2B]/60">
            <Images size={38} />
            <p className="text-sm">Photo coming soon</p>
          </div>
        )}

        {/* Listing category */}
        {badge && (
          <span className="absolute left-4 top-4 rounded-full bg-[#7A1F2B] px-3 py-1 text-sm font-medium text-white shadow-sm">
            {badge}
          </span>
        )}

        {/* Navigation controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousPhoto}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow transition hover:bg-white"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow transition hover:bg-white"
            >
              <ChevronRight size={22} />
            </button>

            {/* Photo counter */}
            <span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View photo ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={`h-20 w-24 flex-none overflow-hidden rounded-xl border-2 transition ${
                activeIndex === index
                  ? "border-[#7A1F2B] opacity-100"
                  : "border-transparent opacity-65 hover:opacity-100"
              }`}
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
