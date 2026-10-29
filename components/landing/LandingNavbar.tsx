
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Compass } from "lucide-react"

type Props = {
  isLoggedIn: boolean
}

export default function LandingNavbar({
  isLoggedIn,
}: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#121012]/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="Odini homepage"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/15 bg-[#7A1F2B] shadow-md">
            <Image
              src="/odini.jpeg"
              alt="Odini logo"
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </div>

          <span className="text-xl font-black tracking-tight text-white transition group-hover:text-[#FF8CA5] sm:text-2xl">
            odini<span className="text-[#e8365d]"></span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-white/65 transition hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/65 transition hover:text-white"
          >
            <Compass size={16} />
            Explore
          </Link>

          <Link
            href="/#explore"
            className="text-sm font-medium text-white/65 transition hover:text-white"
          >
            Featured
          </Link>
        </div>

        {/* Account actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/explore"
                className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:text-white sm:inline-flex"
              >
                Discover
              </Link>

              <Link
                href="/user"
                className="inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#d02d50] sm:px-5 sm:text-sm"
              >
                My account
                <ArrowUpRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-3 py-2.5 text-xs font-semibold text-white/75 transition hover:text-white sm:px-4 sm:text-sm"
              >
                Log in
              </Link>

              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e8365d] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#e8365d]/15 transition hover:bg-[#d02d50] sm:px-5 sm:text-sm"
              >
                Sign up
                <ArrowUpRight
                  size={15}
                  className="hidden sm:block"
                />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Explore navigation */}
      <div className="flex items-center gap-6 border-t border-white/10 px-4 py-2.5 md:hidden">
        <Link
          href="/"
          className="text-xs font-semibold text-white/60 transition hover:text-white"
        >
          Home
        </Link>

        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF8CA5]"
        >
          <Compass size={14} />
          Explore experiences
        </Link>

        <Link
          href="/#explore"
          className="text-xs font-semibold text-white/60 transition hover:text-white"
        >
          Featured
        </Link>
      </div>
    </header>
  )
}
