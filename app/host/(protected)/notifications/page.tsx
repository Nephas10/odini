
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  BellRing,
  BellOff,
  CalendarCheck,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import MarkAsReadButton from "@/components/notifications/MarkAsReadButton"

type Notification = {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  booking_id: string | null
  listing_id: string | null
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lusaka",
  })
}

export default async function HostNotificationsPage() {
  const supabase = await createClient()

  // 1. Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/host/notifications")
  }

  // 2. Verify host role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "host") {
    redirect("/host/become")
  }

  // 3. Fetch host booking notifications
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      id,
      title,
      message,
      is_read,
      created_at,
      booking_id,
      listing_id
    `)
    .eq("recipient_id", user.id)
    .eq("type", "booking_request")
    .order("created_at", { ascending: false })
    .limit(50)

  const notifications: Notification[] = data ?? []

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Back navigation */}
        <Link
          href="/host"
          className="text-sm font-medium text-[#7A1F2B] hover:underline"
        >
          ← Back to dashboard
        </Link>

        {/* Header */}
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#7A1F2B]">
            Host dashboard
          </p>

          <div className="mt-2 flex items-center gap-3">
            <BellRing
              size={30}
              className="text-[#7A1F2B]"
            />

            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Notifications
            </h1>
          </div>

          <p className="mt-3 text-gray-500">
            Keep track of incoming booking requests for
            your listings.
          </p>
        </div>

        {/* Summary */}
        {!error && (
          <div className="mt-8 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm text-gray-500">
                Booking notifications
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {notifications.length}
              </p>
            </div>

            {unreadCount > 0 && (
              <span className="rounded-full bg-[#7A1F2B]/10 px-4 py-2 text-xs font-semibold text-[#7A1F2B]">
                {unreadCount} unread
              </span>
            )}
          </div>
        )}

        {/* Error state */}
        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-white p-8"
          >
            <p className="font-semibold text-red-600">
              Unable to load notifications.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Please refresh the page and try again.
            </p>
          </div>
        ) : notifications.length === 0 ? (

          /* Empty state */
          <div className="mt-6 rounded-2xl bg-white p-12 text-center shadow-sm">
            <BellOff
              size={40}
              className="mx-auto text-[#7A1F2B]"
            />

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No booking notifications yet
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              When guests submit booking requests,
              notifications will appear here.
            </p>
          </div>

        ) : (

          /* Notification list */
          <div className="mt-6 space-y-4">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-2xl border p-6 shadow-sm ${
                  notification.is_read
                    ? "border-gray-100 bg-white"
                    : "border-[#7A1F2B]/30 bg-[#F7EDEF]"
                }`}
              >
                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7A1F2B]/10">
                    <CalendarCheck
                      size={22}
                      className="text-[#7A1F2B]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-3">
                      <h2 className="font-semibold text-gray-900">
                        {notification.title}
                      </h2>

                      {!notification.is_read && (
                        <span
                          aria-label="Unread"
                          className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#7A1F2B]"
                        />
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-3 text-xs text-gray-500">
                      {formatDate(notification.created_at)}
                    </p>

                    {!notification.is_read && (
                      <div className="mt-4">
                        <MarkAsReadButton
                          notificationId={notification.id}
                        />
                      </div>
                    )}

                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
