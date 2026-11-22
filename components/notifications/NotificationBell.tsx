
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"

import { createClient } from "@/lib/supabase/supabase"

type Props = {
  href?: string
  variant?: "user" | "host"
}

export default function NotificationBell({
  href = "/user/notifications",
  variant = "user",
}: Props) {
  const pathname = usePathname()

  const [unreadCount, setUnreadCount] = useState(0)

  const isHost = variant === "host"
  const isActive =
    pathname === href ||
    pathname.startsWith(`${href}/`)

  useEffect(() => {
    let cancelled = false

    async function loadUnreadCount() {
      const supabase = createClient()

      // getSession() reads the login already stored in the browser, with no
      // trip to Supabase. Fine here: the database rules still decide what loads.
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession()
      const user = session?.user

      if (cancelled) return

      if (authError || !user) {
        setUnreadCount(0)
        return
      }

      let query = supabase
        .from("notifications")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("recipient_id", user.id)
        .eq("is_read", false)

      // Match the host notifications page
      if (isHost) {
        query = query.eq("type", "booking_request")
      }

      const { count, error } = await query

      if (cancelled) return

      if (error) {
        console.error(
          "Unable to load unread notifications:",
          error.message
        )
        return
      }

      setUnreadCount(count ?? 0)
    }

    void loadUnreadCount()

    // Refresh when a notification is marked as read
    function handleNotificationChange() {
      void loadUnreadCount()
    }

    // Refresh when the user comes back to the tab
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void loadUnreadCount()
    }

    window.addEventListener(
      "odini:notifications-changed",
      handleNotificationChange
    )
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Check for new notifications once a minute, instead of on every page
    // change (each check is a trip to the database, slow from Zambia)
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadUnreadCount()
    }, 60_000)

    return () => {
      cancelled = true

      window.removeEventListener(
        "odini:notifications-changed",
        handleNotificationChange
      )
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.clearInterval(timer)
    }
  }, [isHost])

  return (
    <Link
      href={href}
      aria-label={`Notifications, ${unreadCount} unread`}
      title="Notifications"
      aria-current={isActive ? "page" : undefined}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
        isHost
          ? "focus-visible:outline-[#D4A64A]"
          : "focus-visible:outline-[#e8365d]"
      } ${
        isHost
          ? isActive
            ? "bg-white/15 text-[#D4A64A]"
            : "text-white/80 hover:bg-white/10 hover:text-white"
          : isActive
            ? "bg-[#e8365d]/15 text-[#e8365d]"
            : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Bell size={19} />

      {/* Unread counter */}
      {unreadCount > 0 && (
        <span
          className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
            isHost
              ? "bg-[#D4A64A] text-[#3D0F15]"
              : "bg-[#e8365d] text-white"
          }`}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  )
}
