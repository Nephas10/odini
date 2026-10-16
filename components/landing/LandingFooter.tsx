
import Link from "next/link"

export default function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

          <div>
            <Link
              href="/"
              className="text-xl font-bold text-[#7A1F2B]"
            >
              Odini
            </Link>

            <p className="mt-2 text-sm text-gray-500">
              Discover. Experience. Connect.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-500">

            <Link
              href="/"
              className="hover:text-[#7A1F2B]"
            >
              Home
            </Link>

            <Link
              href="/#explore"
              className="hover:text-[#7A1F2B]"
            >
              Explore
            </Link>

            <Link
              href="/auth/signup"
              className="hover:text-[#7A1F2B]"
            >
              Join Odini
            </Link>

          </div>

        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Odini. All rights reserved.
          </p>
        </div>

      </div>

    </footer>
  )
}
