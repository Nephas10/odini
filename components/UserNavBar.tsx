"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bookmark, Bell, UserRound } from "lucide-react"

const NAV_LINKS = [
  { href: "/user", label: "Explore", mobileLabel: "Explore" },
  { href: "/user/fyp", label: "FYP", mobileLabel: "FYP" },
  { href: "/user/dashboard", label: "Dashboard", mobileLabel: "Dash" },
]

const ICON_LINKS = [
  { href: "/user/search", label: "Search", icon: Search },
  { href: "/user/saved", label: "Saved listings", icon: Bookmark },
  { href: "/user/notifications", label: "Notifications", icon: Bell },
]

// Explore stays highlighted on listing and booking pages too,
// since those are reached from Explore
function isActive(pathname: string, href: string) {
  if (href === "/user") {
    return pathname === "/user" || pathname.startsWith("/user/listings")
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function UserNavbar() {
  const pathname = usePathname()

  return (
    // sticky (not fixed): the navbar keeps its own space, so it never covers page headings
    <header className="sticky top-0 z-50 bg-[#7A1F2B] shadow-md">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Main row */}
        <div className="flex h-16 items-center gap-6">
          {/* Logo */}
          <Link href="/user" className="shrink-0 text-xl font-black tracking-tight text-white">
            odini
          </Link>

          {/* Desktop links */}
          <nav className="hidden h-full items-center gap-6 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full items-center border-b-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-[#D4A64A] text-white"
                      : "border-transparent text-white/60 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side icons */}
          <div className="ml-auto flex items-center gap-1">
            {ICON_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                </Link>
              )
            })}

            {/* Profile */}
            <Link
              href="/user/profile"
              aria-label="Profile"
              aria-current={isActive(pathname, "/user/profile") ? "page" : undefined}
              className={`ml-1 flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                isActive(pathname, "/user/profile")
                  ? "border-[#D4A64A] text-white"
                  : "border-white/30 text-white/70 hover:border-white hover:text-white"
              }`}
            >
              <UserRound size={16} />
            </Link>
          </div>
        </div>

        {/* Mobile links */}
        <nav className="flex border-t border-white/15 md:hidden" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex-1 border-b-2 py-3 text-center text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  active
                    ? "border-[#D4A64A] text-white"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                {link.mobileLabel}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}