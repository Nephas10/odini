"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Star, X } from "lucide-react"
import { createClient } from "@/lib/supabase/supabase"

const BUCKET = "listing-photos"
const MAX_PHOTOS = 8
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB, same limit as the bucket
const ALLOWED = ["image/jpeg", "image/png", "image/webp"]

type Props = {
  userId: string
  defaultPhotos?: string[]
  error?: string
}

// Uploads photos straight to Supabase Storage and keeps their addresses in order.
// The first photo is the cover. The form receives the list through hidden "photos" inputs.
export default function PhotoUploader({ userId, defaultPhotos = [], error }: Props) {
  const [photos, setPhotos] = useState<string[]>(defaultPhotos)
  const [uploading, setUploading] = useState(0)
  const [message, setMessage] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)

  const spaceLeft = MAX_PHOTOS - photos.length

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setMessage("")

    const files = Array.from(fileList)
    const skipped: string[] = []

    const valid = files.filter((file) => {
      if (!ALLOWED.includes(file.type)) {
        skipped.push(`${file.name} isn't a JPG, PNG or WebP photo`)
        return false
      }
      if (file.size > MAX_BYTES) {
        skipped.push(`${file.name} is bigger than 5 MB`)
        return false
      }
      return true
    })

    const toUpload = valid.slice(0, spaceLeft)
    if (valid.length > toUpload.length) {
      skipped.push(`only ${MAX_PHOTOS} photos are allowed per listing`)
    }

    if (toUpload.length > 0) {
      const supabase = createClient()
      setUploading(toUpload.length)

      // Upload in parallel; keep the ones that succeed, in the order chosen
      const results = await Promise.all(
        toUpload.map(async (file) => {
          const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
          const path = `${userId}/${crypto.randomUUID()}.${ext}`

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { cacheControl: "31536000", upsert: false })

          if (uploadError) {
            console.error("Photo upload failed:", uploadError.message)
            skipped.push(`${file.name} couldn't be uploaded`)
            return null
          }
          return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
        })
      )

      setPhotos((current) => [...current, ...results.filter((url): url is string => !!url)])
      setUploading(0)
    }

    if (skipped.length > 0) setMessage(`Skipped: ${skipped.join("; ")}.`)
    if (fileInput.current) fileInput.current.value = ""
  }

  function remove(url: string) {
    setPhotos((current) => current.filter((p) => p !== url))
  }

  function makeCover(url: string) {
    setPhotos((current) => [url, ...current.filter((p) => p !== url)])
  }

  return (
    <div>
      {/* What the form submits, in order (first = cover) */}
      {photos.map((url) => (
        <input key={url} type="hidden" name="photos" value={url} />
      ))}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((url, index) => (
          <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F7EDEF]">
            <img src={url} alt={`Listing photo ${index + 1}`} className="h-full w-full object-cover" />

            {index === 0 ? (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#D4A64A] px-2 py-0.5 text-[11px] font-bold text-[#3D0F15]">
                <Star size={11} fill="currentColor" />
                Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(url)}
                className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-black/80"
              >
                Make cover
              </button>
            )}

            <button
              type="button"
              onClick={() => remove(url)}
              aria-label={`Remove photo ${index + 1}`}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Upload tile */}
        {spaceLeft > 0 && (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading > 0}
            className={`flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-sm transition disabled:cursor-wait ${
              error ? "border-red-300 text-red-600" : "border-[#7A1F2B]/30 text-[#7A1F2B] hover:border-[#7A1F2B] hover:bg-[#F7EDEF]"
            }`}
          >
            {uploading > 0 ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Uploading {uploading}...
              </>
            ) : (
              <>
                <ImagePlus size={22} />
                {photos.length === 0 ? "Add photos" : "Add more"}
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={ALLOWED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-2 text-xs text-gray-500">
        Up to {MAX_PHOTOS} photos, JPG, PNG or WebP, 5 MB each. The first photo is the cover guests see first.
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {message && <p className="mt-1 text-xs text-[#8A6A1F]">{message}</p>}
    </div>
  )
}