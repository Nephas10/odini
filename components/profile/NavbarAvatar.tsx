
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserRound } from "lucide-react"

import { createClient } from "@/lib/supabase/supabase"

export default function NavbarAvatar() {
  const pathname = usePathname()

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    null
  )
  const [initial, setInitial] = useState("")
  const [imageFailed, setImageFailed] = useState(false)

  const isActive =
    pathname === "/user/profile" ||
    pathname.startsWith("/user/profile/")

  useEffect(() => {
    let cancelled = false

    async function loadAvatar() {
      const supabase = createClient()

      // Identify the currently logged-in user.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (authError || !user) {
        setAvatarUrl(null)
        setInitial("")
        return
      }

      // Fetch only the profile fields needed
      // to display the navbar avatar.
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("firstname, avatar_path")
        .eq("id", user.id)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        console.error(
          "Unable to load navbar avatar:",
          error.message
        )
        setAvatarUrl(null)
        setInitial("")
        return
      }

      // Fallback initial for profiles without images.
      const name = profile?.firstname?.trim() ?? ""

      setInitial(name.charAt(0).toUpperCase())

      // Only use the current user's avatar folder.
      const path = profile?.avatar_path

      if (path && path.startsWith(`${user.id}/`)) {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(path)

        setAvatarUrl(data.publicUrl)
      } else {
        setAvatarUrl(null)
      }

      setImageFailed(false)
    }

    void loadAvatar()

    // Refresh when the user uploads a new picture.
    const handleAvatarUpdate = () => {
      void loadAvatar()
    }

    window.addEventListener(
      "odini:avatar-updated",
      handleAvatarUpdate
    )

    return () => {
      cancelled = true

      window.removeEventListener(
        "odini:avatar-updated",
        handleAvatarUpdate
      )
    }
  }, [pathname])

  return (
    <Link
      href="/user/profile"
      aria-label="My profile"
      title="My profile"
      aria-current={isActive ? "page" : undefined}
      className={`ml-1 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8365d] ${
        isActive
          ? "border-[#e8365d]"
          : "border-white/20 hover:border-[#e8365d]/70"
      }`}
    >
      {avatarUrl && !imageFailed ? (
        // Supabase Storage URLs are displayed directly.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt="My profile picture"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : initial ? (
        <span className="flex h-full w-full items-center justify-center bg-[#7A1F2B] text-sm font-bold text-white">
          {initial}
        </span>
      ) : (
        <UserRound
          size={17}
          className="text-white/70"
        />
      )}
    </Link>
  )
}
