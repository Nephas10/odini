"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { signupAction } from "../action"

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/15"

export default function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!acceptedTerms) {
      setError("Please agree to the Terms and Conditions to create your account.")
      return
    }

    setLoading(true)

    const result = await signupAction({
      name,
      email,
      phone,
      password,
      acceptedTerms,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error || "We couldn't create your account. Please try again.")
      return
    }

    window.location.href = "/user"
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
              <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="mt-2 text-sm text-gray-500">
                Join Odini and start discovering experiences.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                  WhatsApp Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+260 97 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked)
                    if (e.target.checked) setError("")
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#7A1F2B]"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#7A1F2B] hover:underline"
                  >
                    Terms and Conditions
                  </Link>
                </span>
              </label>

              {/* Error */}
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Login */}
            <div className="mt-7 border-t border-gray-100 pt-6 text-center">
              <span className="text-sm text-gray-500">Already have an account? </span>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-[#7A1F2B] hover:underline"
              >
                Log in
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Create an account to explore and book experiences on Odini.
          </p>
        </div>
      </div>
    </main>
  )
}