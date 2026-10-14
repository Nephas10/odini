"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeftRight } from "lucide-react"

const LINKS = [
  { href: "/host", label: "Dashboard" },
  { href: "/host/listings", label: "Listings" },
  { href: "/host/bookings", label: "Bookings" },
]

// Dashboard is only active on /host itself; the others also cover their sub-pages
function isActive(pathname: string, href: string) {
  if (href === "/host") return pathname === "/host"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function HostNavbar({ businessName }: { businessName: string }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-[#3D0F15] shadow-md">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center gap-6">
          <Link href="/host" className="flex shrink-0 items-baseline gap-2">
            <span className="text-xl font-black tracking-tight text-white">odini</span>
            <span className="rounded-full bg-[#D4A64A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3D0F15]">
              Host
            </span>
          </Link>

          <nav className="hidden h-full items-center gap-6 md:flex" aria-label="Host navigation">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full items-center border-b-2 text-sm font-semibold transition-colors ${
                    active ? "border-[#D4A64A] text-white" : "border-transparent text-white/60 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden max-w-[12rem] truncate text-sm text-white/70 lg:block">
              {businessName}
            </span>
            {/* Back to the guest side of ODINI */}
            <Link
              href="/user"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              <ArrowLeftRight size={14} />
              <span className="hidden sm:inline">Switch to</span> guest
            </Link>
          </div>
        </div>

        {/* Mobile links */}
        <nav className="flex border-t border-white/15 md:hidden" aria-label="Host mobile navigation">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex-1 border-b-2 py-3 text-center text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  active ? "border-[#D4A64A] text-white" : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}