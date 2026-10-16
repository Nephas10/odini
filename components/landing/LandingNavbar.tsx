
import Link from "next/link"
import Image from "next/image"

type Props = {
  isLoggedIn: boolean
}

export default function LandingNavbar({ isLoggedIn }: Props) {
  return (
    <header className="border-b border-gray-100 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A1F2B] text-lg font-bold text-white">
            <Image
                src="/odini.jpeg"
                alt="Odini Logo"
                width={40}
                height={40}
            />
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isLoggedIn ? (
            <Link
              href="/user"
              className="rounded-full bg-[#7A1F2B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#641924] sm:px-6"
            >
              Explore
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:text-[#7A1F2B]"
              >
                Log in
              </Link>

              <Link
                href="/auth/signup"
                className="rounded-full bg-[#7A1F2B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#641924] sm:px-6"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

      </nav>
    </header>
  )
}
