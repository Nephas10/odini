import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, BellOff,CalendarCheck, CalendarX, Info, ArrowRight } from "lucide-react";
import MarkAsReadButton from "@/components/notifications/MarkAsReadButton"

import { createClient } from "@/lib/supabase/server";

type Notification = {
    id: string
    type: string
    title: string
    message: string
    is_read: boolean
    created_at: string
    listing_id: string | null
    booking_id: string | null
}

function getNotificationIcon(type: string){
    switch(type){
        case "booking_request":
        case "booking_confirmed":
            return CalendarCheck
        
        case "booking_cancelled":
            return CalendarX

        default:
            return Info
    }
}
function formatNotificationDate(date: string){
    return new Date(date).toLocaleString("en-ZM", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Lusaka",
    })
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  // 1. Verify the logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/user/notifications")
  }

  // 2. Fetch notifications belonging to this user
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      id,
      type,
      title,
      message,
      is_read,
      created_at,
      listing_id,
      booking_id
    `)
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const notifications: Notification[] = data ?? []

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#e8365d]">
            Your updates
          </p>

          <div className="mt-2 flex items-center gap-3">
            <Bell
              size={30}
              className="text-[#e8365d]"
            />

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Notifications
            </h1>
          </div>

          <p className="mt-3 text-sm text-white/60">
            Stay informed about your bookings and experiences.
          </p>
        </div>

        {/* Error state */}
        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-[#141414] p-8"
          >
            <h2 className="font-semibold">
              Unable to load notifications
            </h2>

            <p className="mt-2 text-sm text-white/60">
              Please refresh the page and try again.
            </p>
          </div>
        ) : notifications.length === 0 ? (

          /* Empty state */
          <div className="rounded-2xl border border-dashed border-white/20 bg-[#111111] px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8365d]/10">
              <BellOff
                size={28}
                className="text-[#e8365d]"
              />
            </div>

            <h2 className="mt-6 text-xl font-bold">
              You're all caught up!
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
              You don't have any notifications yet.
              Updates about your bookings and experiences
              will appear here.
            </p>

            <Link
              href="/user"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f05272]"
            >
              Explore listings
              <ArrowRight size={16} />
            </Link>
          </div>

        ) : (
          <>
            {/* Notification count */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-white/60">
                {notifications.length} notifications
              </p>

              {unreadCount > 0 && (
                <span className="rounded-full bg-[#e8365d]/10 px-3 py-1 text-xs font-semibold text-[#e8365d]">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {/* Notification list */}
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(
                  notification.type
                )

                return (
                  <article
                    key={notification.id}
                    className={`rounded-2xl border p-5 transition ${
                      notification.is_read
                        ? "border-white/10 bg-[#111111]"
                        : "border-[#e8365d]/30 bg-[#1b1115]"
                    }`}
                  >
                    <div className="flex items-start gap-4">

                      {/* Icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8365d]/10">
                        <Icon
                          size={20}
                          className="text-[#e8365d]"
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-white">
                          {notification.title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-white/60">
                          {notification.message}
                        </p>

                        <p className="mt-3 text-xs text-white/40">
                          {formatNotificationDate(
                            notification.created_at
                          )}
                        </p>
                        {!notification.is_read && (
                          <div className="mt-4">
                            <MarkAsReadButton
                              notificationId={notification.id}
                              />
                          </div>
                        )}
                      </div>

                      {/* Unread indicator */}
                      {!notification.is_read && (
                        <span
                          aria-label="Unread"
                          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#e8365d]"
                        />
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}

      </div>
    </main>
  )
}