
"use client"

import {
  type FormEvent,
  Suspense,
  useState,
} from "react"

import Image from "next/image"
import Link from "next/link"

import {
  useRouter,
  useSearchParams,
} from "next/navigation"

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react"

import { loginAction } from "../action"

// Reusable input styling
const inputClass =
  "w-full rounded-xl border bg-[#242024] px-4 py-3.5 pl-11 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#e8365d] focus:ring-2 focus:ring-[#e8365d]/15"

// Only allow internal destinations used by authenticated
// guest and host pages.
function safeNext(value: string | null): string {
  if (!value) return "/user"

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    return "/user"
  }

  const path = value.split(/[?#]/, 1)[0]

  if (
    path === "/user" ||
    path.startsWith("/user/") ||
    path === "/host" ||
    path.startsWith("/host/")
  ) {
    return value
  }

  return "/user"
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Preserve the listing the visitor wanted to book
  const next = safeNext(searchParams.get("next"))

  const signupHref =
    `/auth/signup?next=${encodeURIComponent(next)}`

  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [showPassword, setShowPassword] =
    useState(false)

  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const linkExpired =
    searchParams.get("error") === "link"

  // Handle login
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (loading) return

    setError("")

    const cleanEmail = email.trim().toLowerCase()

    // Client-side validation
    const newErrors = {
      email: !cleanEmail
        ? "Please enter your email."
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
          ? "Please enter a valid email address."
          : "",

      password: !password
        ? "Please enter your password."
        : "",
    }

    setFieldErrors(newErrors)

    if (newErrors.email || newErrors.password) {
      return
    }

    setLoading(true)

    try {
      // Existing Supabase authentication action
      const result = await loginAction({
        email: cleanEmail,
        password,
      })

      if (!result.success) {
        setError(
          result.error ||
            "We couldn't log you in. Please try again."
        )
        return
      }

      // Return to intended listing or default dashboard
      router.replace(next)
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)

      setError(
        "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#121012] px-4 py-12 text-white sm:px-6">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-[#7A1F2B]/25 blur-[110px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-[#e8365d]/10 blur-[110px]" />

      <div className="relative w-full max-w-md">

        {/* Back to public discovery */}
        <Link
          href="/explore"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-[#FF8CA5]"
        >
          <ArrowLeft size={17} />
          Back to Explore
        </Link>

        {/* Brand */}
        <div className="mb-8 text-center">

          <Link
            href="/"
            aria-label="Odini homepage"
            className="mx-auto flex w-fit flex-col items-center"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-[#7A1F2B] shadow-lg">
              <Image
                src="/odini.jpeg"
                alt="Odini logo"
                fill
                sizes="64px"
                className="object-cover"
                priority
              />
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
              odini
              <span className="text-[#e8365d]">.</span>
            </h1>
          </Link>

          <p className="mt-2 text-sm text-white/45">
            Discover places. Experience more.
          </p>

        </div>

        {/* Login card */}
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#1C1A1D] p-6 shadow-2xl shadow-black/20 sm:p-8">

          {/* Card header */}
          <div className="mb-8">

            <span className="inline-flex items-center gap-2 rounded-full border border-[#e8365d]/20 bg-[#e8365d]/10 px-3 py-1.5 text-xs font-semibold text-[#FF8CA5]">
              <LockKeyhole size={14} />
              Welcome back
            </span>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Log in to Odini
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Access your bookings, discover experiences
              and continue where you left off.
            </p>
          </div>

          {/* Expired or already-used link */}
          {linkExpired && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200"
            >
              That link has expired or was already used.
              Please request a new one.
            </div>
          )}

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Email address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@example.com"
                  value={email}
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email
                      ? "email-error"
                      : undefined
                  }
                  onChange={(e) => {
                    setEmail(e.target.value)

                    setFieldErrors((current) => ({
                      ...current,
                      email: "",
                    }))
                  }}
                  className={`${inputClass} ${
                    fieldErrors.email
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                />
              </div>

              {fieldErrors.email && (
                <p
                  id="email-error"
                  className="mt-2 text-xs text-red-400"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>

              <div className="mb-2 flex items-center justify-between gap-3">

                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-white/80"
                >
                  Password
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-[#FF8CA5] transition hover:text-white"
                >
                  Forgot password?
                </Link>

              </div>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password
                      ? "password-error"
                      : undefined
                  }
                  onChange={(e) => {
                    setPassword(e.target.value)

                    setFieldErrors((current) => ({
                      ...current,
                      password: "",
                    }))
                  }}
                  className={`${inputClass} pr-12 ${
                    fieldErrors.password
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                />

                {/* Show / hide password */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              {fieldErrors.password && (
                <p
                  id="password-error"
                  className="mt-2 text-xs text-red-400"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Server error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#e8365d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e8365d]/15 transition hover:bg-[#d02d50] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Log in

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-center text-xs leading-6 text-white/40">
              By logging in, you agree to our{" "}

              <Link
                href="/terms"
                className="font-semibold text-[#FF8CA5] hover:underline"
              >
                Terms and Conditions
              </Link>
              .
            </p>

          </form>

          {/* Signup link */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">

            <p className="text-sm text-white/55">
              New to Odini?{" "}

              <Link
                href={signupHref}
                className="font-bold text-[#FF8CA5] transition hover:text-white"
              >
                Create an account
              </Link>
            </p>

          </div>
        </div>

        {/* Browse without login */}
        <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-white/40">
          <ShieldCheck
            size={16}
            className="text-[#FF8CA5]"
          />

          <p>
            No account needed to explore Odini.
          </p>
        </div>

      </div>
    </main>
  )
}

// useSearchParams needs Suspense in Next.js.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#121012] text-white/60">
          Loading login...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
