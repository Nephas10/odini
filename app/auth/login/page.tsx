"use client"

import { FormEvent, Suspense, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { loginAction } from "../action"

const inputClass =
  "w-full rounded-xl border px-4 py-3 pl-11 text-sm text-gray-900 outline-none transition focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/15"

// Only allow redirects back into our own app (e.g. "/user/listings/123/book"),
// never to another website.
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next
  return "/user"
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get("next"))

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const newErrors = {
      email: email.trim() ? "" : "Please enter your email.",
      password: password ? "" : "Please enter your password.",
    }
    setFieldErrors(newErrors)
    if (newErrors.email || newErrors.password) return

    setLoading(true)
    const result = await loginAction({ email, password })

    if (!result.success) {
      setLoading(false)
      setError(result.error || "We couldn't log you in. Please try again.")
      return
    }

    // Go back to where they came from (or Explore), and refresh so every
    // page sees the new login straight away
    router.replace(next)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 overflow-hidden rounded-2xl bg-[#7A1F2B]">
              <Image
                src="/odini.jpeg"
                alt="ODINI logo"
                height={48}
                width={48}
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Odini</h1>
            <p className="mt-2 text-sm text-gray-500">Discover stays, events and activities.</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-500">Log in to book and manage your experiences.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A1F2B]/50"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setFieldErrors((f) => ({ ...f, email: "" }))
                    }}
                    className={`${inputClass} ${fieldErrors.email ? "border-red-300" : "border-gray-200"}`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A1F2B]/50"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setFieldErrors((f) => ({ ...f, password: "" }))
                    }}
                    className={`${inputClass} pr-11 ${fieldErrors.password ? "border-red-300" : "border-gray-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-[#7A1F2B]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              {/* Error from the server */}
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

              <p className="text-center text-xs text-gray-500">
                By logging in, you agree to our{" "}
                <Link href="/terms" className="font-medium text-[#7A1F2B] hover:underline">
                  Terms and Conditions
                </Link>
              </p>
            </form>

            {/* Sign up */}
            <div className="mt-7 border-t border-gray-100 pt-6 text-center">
              <span className="text-sm text-gray-500">Don't have an account? </span>
              <Link
                href="/auth/signup"
                className="text-sm font-semibold text-[#7A1F2B] hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// useSearchParams needs a Suspense wrapper, or `npm run build` fails on Vercel
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}