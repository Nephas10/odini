
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
  Phone,
  ShieldCheck,
  UserRound,
  CheckCircle2,
} from "lucide-react"

import { signupAction } from "../action"
import { createClient } from "@/lib/supabase/supabase"

const inputClass =
  "w-full rounded-xl border bg-[#242024] px-4 py-3.5 pl-11 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#e8365d] focus:ring-2 focus:ring-[#e8365d]/15"

// Match the safe redirect behavior of the Login page
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

type FieldErrors = {
  name: string
  email: string
  phone: string
  password: string
  terms: string
}

const emptyErrors: FieldErrors = {
  name: "",
  email: "",
  phone: "",
  password: "",
  terms: "",
}

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const next = safeNext(searchParams.get("next"))

  const loginHref =
    `/auth/login?next=${encodeURIComponent(next)}`

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  const [showPassword, setShowPassword] =
    useState(false)

  const [acceptedTerms, setAcceptedTerms] =
    useState(false)

  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>(emptyErrors)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Used when signup succeeds but an authenticated
  // session is not available yet.
  const [registrationComplete, setRegistrationComplete] =
    useState(false)

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (loading || registrationComplete) return

    setError("")

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.trim()

    const newErrors: FieldErrors = {
      name:
        cleanName.length < 2
          ? "Please enter your full name."
          : "",

      email: !cleanEmail
        ? "Please enter your email."
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
          ? "Please enter a valid email address."
          : "",

      phone: !cleanPhone
        ? "Please enter your WhatsApp number."
        : "",

      password: !password
        ? "Please create a password."
        : password.length < 8
          ? "Password must be at least 8 characters."
          : "",

      terms: !acceptedTerms
        ? "Please accept the Terms and Conditions."
        : "",
    }

    setFieldErrors(newErrors)

    if (Object.values(newErrors).some(Boolean)) {
      return
    }

    setLoading(true)

    try {
      const result = await signupAction({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        acceptedTerms,
      })

      if (!result.success) {
        setError(
          result.error ||
            "We couldn't create your account. Please try again."
        )
        return
      }

      // A successful signup does not always create a session.
      // Supabase may require email confirmation first.
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        router.replace(next)
        router.refresh()
      } else {
        setRegistrationComplete(true)
      }
    } catch (err) {
      console.error("Signup error:", err)

      setError(
        "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#121012] px-4 py-12 text-white sm:px-6">

      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-[#7A1F2B]/25 blur-[110px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-[#e8365d]/10 blur-[110px]" />

      <div className="relative w-full max-w-md">

        {/* Back to public Explore */}
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

            <h1 className="mt-4 text-3xl font-black tracking-tight">
              odini
              <span className="text-[#e8365d]">.</span>
            </h1>
          </Link>

          <p className="mt-2 text-sm text-white/45">
            Discover places. Experience more.
          </p>
        </div>

        {/* Signup card */}
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#1C1A1D] p-6 shadow-2xl shadow-black/20 sm:p-8">

          {registrationComplete ? (
            /* Successful registration without a session */
            <div className="py-5 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2
                  size={32}
                  className="text-emerald-400"
                />
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Account created!
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Your registration was successful.
                If you received a verification email,
                confirm your address before logging in
                to continue.
              </p>

              <Link
                href={loginHref}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e8365d] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#d02d50]"
              >
                Continue to login
                <ArrowRight size={17} />
              </Link>

            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">

                <span className="inline-flex items-center gap-2 rounded-full border border-[#e8365d]/20 bg-[#e8365d]/10 px-3 py-1.5 text-xs font-semibold text-[#FF8CA5]">
                  <UserRound size={14} />
                  Join the experience
                </span>

                <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                  Create your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Join Odini to book stays, events
                  and exciting activities across Zambia.
                </p>
              </div>

              {/* Signup form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
              >

                {/* Full name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-white/80"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={name}
                      disabled={loading}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={
                        fieldErrors.name
                          ? "name-error"
                          : undefined
                      }
                      onChange={(e) => {
                        setName(e.target.value)
                        clearFieldError("name")
                      }}
                      className={`${inputClass} ${
                        fieldErrors.name
                          ? "border-red-500/60"
                          : "border-white/10"
                      }`}
                    />
                  </div>

                  {fieldErrors.name && (
                    <p
                      id="name-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

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
                          ? "signup-email-error"
                          : undefined
                      }
                      onChange={(e) => {
                        setEmail(e.target.value)
                        clearFieldError("email")
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
                      id="signup-email-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* WhatsApp number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-white/80"
                  >
                    WhatsApp number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+260 97 123 4567"
                      value={phone}
                      disabled={loading}
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={
                        fieldErrors.phone
                          ? "phone-error"
                          : "phone-hint"
                      }
                      onChange={(e) => {
                        setPhone(e.target.value)
                        clearFieldError("phone")
                      }}
                      className={`${inputClass} ${
                        fieldErrors.phone
                          ? "border-red-500/60"
                          : "border-white/10"
                      }`}
                    />
                  </div>

                  <p
                    id="phone-hint"
                    className="mt-2 text-xs text-white/35"
                  >
                    Include your country code, e.g. +260.
                  </p>

                  {fieldErrors.phone && (
                    <p
                      id="phone-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-white/80"
                  >
                    Password
                  </label>

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
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      value={password}
                      disabled={loading}
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={
                        fieldErrors.password
                          ? "signup-password-error"
                          : "password-hint"
                      }
                      onChange={(e) => {
                        setPassword(e.target.value)
                        clearFieldError("password")
                      }}
                      className={`${inputClass} pr-12 ${
                        fieldErrors.password
                          ? "border-red-500/60"
                          : "border-white/10"
                      }`}
                    />

                    {/* Password visibility */}
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

                  <p
                    id="password-hint"
                    className="mt-2 text-xs text-white/35"
                  >
                    Use at least 8 characters.
                  </p>

                  {fieldErrors.password && (
                    <p
                      id="signup-password-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <label className="flex cursor-pointer items-start gap-3">

                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      disabled={loading}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked)
                        clearFieldError("terms")
                      }}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 accent-[#e8365d]"
                    />

                    <span className="text-sm leading-6 text-white/55">
                      I agree to the{" "}

                      <Link
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#FF8CA5] hover:underline"
                      >
                        Terms and Conditions
                      </Link>
                    </span>
                  </label>

                  {fieldErrors.terms && (
                    <p className="mt-2 text-xs text-red-400">
                      {fieldErrors.terms}
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
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#e8365d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e8365d]/15 transition hover:bg-[#d02d50] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create account

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

              </form>

              {/* Login link */}
              <div className="mt-8 border-t border-white/10 pt-6 text-center">

                <p className="text-sm text-white/55">
                  Already have an account?{" "}

                  <Link
                    href={loginHref}
                    className="font-bold text-[#FF8CA5] transition hover:text-white"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Public discovery message */}
        <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-white/40">
          <ShieldCheck
            size={16}
            className="text-[#FF8CA5]"
          />

          <p>
            Browse Odini freely. Sign up when you're
            ready to book.
          </p>
        </div>

      </div>
    </main>
  )
}

// useSearchParams requires a Suspense boundary.
export default function SignUp() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#121012] text-white/60">
          Loading signup...
        </main>
      }
    >
      <SignUpForm />
    </Suspense>
  )
}
