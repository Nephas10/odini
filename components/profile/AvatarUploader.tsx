
"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

import {
  Camera,
  CheckCircle2,
  LoaderCircle,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/supabase"
import { saveProfileAvatarAction } from "@/app/user/profile/action"

type Props = {
  displayName: string
  initialAvatarPath: string | null
}

const MAX_FILE_SIZE = 2 * 1024 * 1024

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export default function AvatarUploader({
  displayName,
  initialAvatarPath,
}: Props) {
  const router = useRouter()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarPath, setAvatarPath] = useState(
    initialAvatarPath
  )

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const supabase = createClient()

  const avatarUrl = avatarPath
    ? supabase.storage
        .from("avatars")
        .getPublicUrl(avatarPath).data.publicUrl
    : null

  const initial =
    displayName.trim().charAt(0).toUpperCase() || "O"

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file || uploading) return

    setError("")
    setSuccess("")

    const extension = IMAGE_TYPES[file.type]

    if (!extension) {
      setError(
        "Please select a JPG, PNG or WebP image."
      )
      event.target.value = ""
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Your profile picture must be smaller than 5 MB."
      )
      event.target.value = ""
      return
    }

    setUploading(true)

    let uploadedPath: string | null = null

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error(
          "Your session has expired. Please log in again."
        )
      }

      // Each user uploads into their own folder.
      // Unique filenames prevent stale image caching.
      const filename =
        `avatar-${crypto.randomUUID()}.${extension}`

      const path = `${user.id}/${filename}`

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(path, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      uploadedPath = path

      // Save the new image path in the user's profile.
      const result =
        await saveProfileAvatarAction(path)

      if (!result.success) {
        throw new Error(
          result.error ||
            "Could not update your profile picture."
        )
      }

      const previousPath = avatarPath

      setAvatarPath(path)
      setSuccess("Profile picture updated successfully.")

      // Tell the navbar to reload the profile picture.
      window.dispatchEvent(
        new Event("odini:avatar-updated")
      )
      // Remove the old image after the new one is saved.
      if (previousPath && previousPath !== path) {
        const { error: cleanupError } =
          await supabase.storage
            .from("avatars")
            .remove([previousPath])

        if (cleanupError) {
          console.warn(
            "Old avatar cleanup failed:",
            cleanupError.message
          )
        }
      }

      // Refresh the Server Component so it can load
      // the latest profile information.
      router.refresh()
    } catch (err) {
      // If saving the database path failed, remove the
      // newly uploaded image so it isn't orphaned.
      if (uploadedPath) {
        await supabase.storage
          .from("avatars")
          .remove([uploadedPath])
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload your profile picture."
      )
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

      {/* Avatar */}
      <div className="relative w-fit shrink-0">

        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#1C1A1D] bg-[#e8365d] text-3xl font-black text-white shadow-lg sm:h-28 sm:w-28">

          {avatarUrl ? (
            // Using a normal image allows Supabase
            // Storage URLs without remotePatterns setup.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={`${displayName}'s profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        {/* Camera button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload profile picture"
          className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#1C1A1D] bg-[#e8365d] text-white shadow-md transition hover:bg-[#d02d50] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <LoaderCircle
              size={17}
              className="animate-spin"
            />
          ) : (
            <Camera size={17} />
          )}
        </button>

        {/* Hidden file picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={uploading}
          className="hidden"
          aria-label="Choose profile image"
        />
      </div>

      {/* Text and upload action */}
      <div className="min-w-0">

        <h3 className="wrap-break-word text-xl font-bold text-white">
          {displayName}
        </h3>

        <p className="mt-1 text-sm text-white/45">
          Odini member
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#FF8CA5] transition hover:text-white disabled:opacity-60"
        >
          {uploading ? (
            <>
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
              Uploading picture...
            </>
          ) : (
            <>
              <UserRound size={16} />
              {avatarPath
                ? "Change profile picture"
                : "Upload profile picture"}
            </>
          )}
        </button>

        {/* <p className="mt-2 text-xs text-white/35">
          JPG, PNG or WebP. Maximum 5 MB.
        </p> */}

        {error && (
          <p
            role="alert"
            className="mt-3 max-w-xs text-xs leading-5 text-red-400"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mt-3 flex items-center gap-2 text-xs text-emerald-400"
          >
            <CheckCircle2 size={15} />
            {success}
          </p>
        )}
      </div>
    </div>
  )
}
