
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bookmark } from "lucide-react"

import NotificationBell from "@/components/notifications/NotificationBell"
import NavbarAvatar from "@/components/profile/NavbarAvatar"

const NAV_LINKS = [
  {
    href: "/user",
    label: "Explore",
    mobileLabel: "Explore",
  },
  {
    href: "/user/fyp",
    label: "FYP",
    mobileLabel: "FYP",
  },
  {
    href: "/user/dashboard",
    label: "Dashboard",
    mobileLabel: "Dash",
  },
]

const ICON_LINKS = [
  {
    href: "/user/saved",
    label: "Saved listings",
    icon: Bookmark,
  },
]

// Explore remains highlighted on listing
// and booking detail pages.
function isActive(pathname: string, href: string) {
  if (href === "/user") {
    return (
      pathname === "/user" ||
      pathname.startsWith("/user/listings")
    )
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  )
}

export default function UserNavbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-black/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">

      <div className="mx-auto max-w-7xl px-4 md:px-6">

        {/* Main navigation row */}
        <div className="flex h-14 items-center gap-6">

          {/* Logo */}
          <Link
            href="/user"
            className="shrink-0 text-xl font-normal tracking-tight text-white [font-family:var(--odini-font-display,inherit)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8365d]"
          >
            odini
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden h-full items-center gap-6 md:flex"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(
                pathname,
                link.href
              )

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`flex h-full items-center border-b-2 text-sm font-normal [font-family:var(--odini-font-display,inherit)] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#e8365d] ${
                    active
                      ? "border-[#e8365d] text-white"
                      : "border-transparent text-white/50 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-1">

            {/* Saved listings */}
            {ICON_LINKS.map(
              ({ href, label, icon: Icon }) => {
                const active = isActive(
                  pathname,
                  href
                )

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-label={label}
                    title={label}
                    aria-current={
                      active ? "page" : undefined
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8365d] ${
                      active
                        ? "bg-white/15 text-white"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                  </Link>
                )
              }
            )}

            {/* Existing notification bell */}
            <NotificationBell />

            {/* NEW: Uploaded profile picture */}
            <NavbarAvatar />

          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav
        className="flex border-t border-white/8 md:hidden"
        aria-label="Mobile navigation"
      >
        {NAV_LINKS.map((link) => {
          const active = isActive(
            pathname,
            link.href
          )

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                active ? "page" : undefined
              }
              className={`flex-1 border-b-2 py-2.5 text-center text-[11px] font-normal uppercase tracking-widest transition-colors [font-family:var(--odini-font-display,inherit)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#e8365d] ${
                active
                  ? "border-[#e8365d] text-white"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {link.mobileLabel}
            </Link>
          )
        })}
      </nav>

    </header>
  )
}
