
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"

import { createClient } from "@/lib/supabase/supabase"

export default function NotificationBell() {
  const pathname = usePathname()

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadUnreadCount() {
      const supabase = createClient()

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (authError || !user) {
        setUnreadCount(0)
        return
      }

      const { count, error } = await supabase
        .from("notifications")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("recipient_id", user.id)
        .eq("is_read", false)

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

    loadUnreadCount()

    return () => {
      cancelled = true
    }
  }, [pathname])

  const isActive =
    pathname === "/user/notifications"

  return (
    <Link
      href="/user/notifications"
      aria-label={`Notifications, ${unreadCount} unread`}
      title="Notifications"
      aria-current={isActive ? "page" : undefined}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition ${
        isActive
          ? "bg-[#e8365d]/15 text-[#e8365d]"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Bell size={19} />

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e8365d] px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  )
}
