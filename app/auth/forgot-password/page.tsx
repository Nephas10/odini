"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, MailCheck } from "lucide-react"
import { requestPasswordReset } from "../action"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email.")
      return
    }

    setLoading(true)
    const result = await requestPasswordReset({ email })
    setLoading(false)

    if (!result.success) {
      setError(result.error || "Something went wrong. Please try again.")
      return
    }

    setSent(true)
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          {sent ? (
            /* After sending: same message whether or not the email has an account,
               so nobody can use this page to check who is registered */
            <div className="text-center">
              <MailCheck size={48} className="mx-auto text-[#7A1F2B]" />
              <h1 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                If an account exists for <span className="font-medium text-gray-700">{email.trim()}</span>,
                we've sent a link to reset your password. It may take a minute to arrive, and
                it's worth checking your spam folder.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#7A1F2B] hover:underline"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>

              <h1 className="mt-5 text-2xl font-bold text-gray-900">Forgot your password?</h1>
              <p className="mt-2 text-sm text-gray-500">
                Enter the email you signed up with and we'll send you a link to set a new password.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
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
                        setError("")
                      }}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-11 text-sm text-gray-900 outline-none transition focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/15"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending link..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}