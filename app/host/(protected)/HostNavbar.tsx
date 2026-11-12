
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftRight,
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  BriefcaseBusiness,
  ArrowUpRight,
  ChartNoAxesCombined,
} from "lucide-react"
import Image from "next/image"

import NotificationBell from "@/components/notifications/NotificationBell"

const LINKS = [
  {
    href: "/host",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/host/listings",
    label: "Listings",
    icon: Building2,
  },
  {
    href: "/host/bookings",
    label: "Bookings",
    icon: CalendarCheck2,
  },
  {
    href: "/host/analytics",
    label: "Analytics",
    icon: ChartNoAxesCombined,
  }
]

function isActive(pathname: string, href: string) {
  if (href === "/host") {
    return pathname === "/host"
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  )
}

type Props = {
  businessName: string
}

export default function HostNavbar({
  businessName,
}: Props) {
  const pathname = usePathname()

  const displayName =
    businessName?.trim() || "My Business"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#3D0F15]/95 text-white shadow-[0_4px_24px_rgba(32,5,10,0.16)] backdrop-blur-xl">

      {/* Subtle brand accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#D4A64A]/20 via-[#D4A64A] to-[#D4A64A]/20" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* TOP NAVBAR */}
        <div className="flex h-[72px] items-center justify-between gap-4">

          {/* BRAND */}
          <div className="flex shrink-0 items-center gap-3">

            <Link
              href="/host"
              aria-label="Odini Host Dashboard"
              className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#D4A64A]"
            >
              {/* Brand mark */}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D4A64A]/25 bg-[#D4A64A]/15 transition-colors group-hover:bg-[#D4A64A]/25">
                <Image
                  src="/odini.jpeg"
                  alt="Odini Logo"
                  width={40}
                  height={40}
                />
              </div>

              {/* Brand text */}
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-black tracking-[-0.05em] text-white">
                  odini
                </span>

                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#D4A64A]">
                  Host Workspace
                </span>
              </div>
            </Link>

          </div>

          {/* DESKTOP NAVIGATION */}
          <nav
            aria-label="Host navigation"
            className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.05] p-1.5 md:flex"
          >
            {LINKS.map((link) => {
              const active = isActive(
                pathname,
                link.href
              )

              const Icon = link.icon

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`
                    group relative flex items-center gap-2
                    rounded-xl px-4 py-2.5
                    text-[13px] font-semibold
                    transition-all duration-200
                    outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#D4A64A]
                    ${
                      active
                        ? "bg-white text-[#3D0F15] shadow-sm"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.3 : 1.9}
                    className={
                      active
                        ? "text-[#7A1F2B]"
                        : "text-white/60 transition-colors group-hover:text-white"
                    }
                  />

                  <span>{link.label}</span>

                  {/* Active indicator */}
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4A64A]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            {/* Business identity - desktop */}
            <div className="hidden items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 lg:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4A64A]/15 text-[#D4A64A]">
                <BriefcaseBusiness size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium text-white/45">
                  Managing
                </p>

                <p
                  className="max-w-[130px] truncate text-xs font-semibold text-white"
                  title={displayName}
                >
                  {displayName}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden h-7 w-px bg-white/15 lg:block" />

            {/* Notifications */}
            <div className="flex items-center justify-center">
              <NotificationBell
                href="/host/notifications"
                variant="host"
              />
            </div>

            {/* Switch to guest */}
            <Link
              href="/user"
              aria-label="Switch to guest side"
              className="
                group inline-flex h-10 items-center
                justify-center gap-2 rounded-xl
                border border-[#D4A64A]/30
                bg-[#D4A64A]/10 px-3
                text-xs font-semibold
                text-[#F1CC7B]
                transition-all duration-200
                hover:border-[#D4A64A]/60
                hover:bg-[#D4A64A]/20
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#D4A64A]
                sm:px-4
              "
            >
              <ArrowLeftRight
                size={16}
                strokeWidth={2}
              />

              <span className="hidden sm:inline">
                Guest
              </span>

              <ArrowUpRight
                size={14}
                className="hidden opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block"
              />
            </Link>

          </div>

        </div>

        {/* MOBILE NAVIGATION */}
        <nav
          aria-label="Host mobile navigation"
          className="border-t border-white/10 py-2.5 md:hidden"
        >
          <div className="grid grid-cols-4 gap-1  sm:gap-2">
            {LINKS.map((link) => {
              const active = isActive(
                pathname,
                link.href
              )

              const Icon = link.icon

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`
                    flex min-h-[55px] flex-col
                    items-center justify-center
                    gap-1.5 rounded-xl
                    border px-2 py-2
                    text-[11px] font-semibold
                    transition-all duration-200
                    outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#D4A64A]
                    ${
                      active
                        ? "border-[#D4A64A]/35 bg-[#D4A64A]/15 text-[#F1CC7B]"
                        : "border-transparent text-white/50 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={
                      active ? 2.3 : 1.8
                    }
                  />

                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

      </div>
    </header>
  )
}
