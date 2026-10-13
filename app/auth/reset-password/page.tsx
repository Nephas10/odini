"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react"
import { updatePassword } from "../action"

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/15"

// The user arrives here from the reset email (via /auth/callback, which has signed them in).
export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState("")
  const [linkExpired, setLinkExpired] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("The two passwords don't match.")
      return
    }

    setLoading(true)
    const result = await updatePassword({ password })
    setLoading(false)

    if (!result.success) {
      setError(result.error || "We couldn't update your password. Please try again.")
      if (result.expired) setLinkExpired(true)
      return
    }

    setDone(true)
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle2 size={48} className="mx-auto text-[#7A1F2B]" />
              <h1 className="mt-4 text-2xl font-bold text-gray-900">Password updated</h1>
              <p className="mt-3 text-sm text-gray-500">
                Your new password is saved and you're logged in.
              </p>
              <button
                onClick={() => {
                  router.replace("/user")
                  router.refresh()
                }}
                className="mt-6 inline-flex rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
              >
                Continue to ODINI
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>
              <p className="mt-2 text-sm text-gray-500">
                Pick something at least 6 characters long that you haven't used here before.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                {/* New password */}
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A1F2B]/50"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter a new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError("")
                      }}
                      className={inputClass}
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
                </div>

                {/* Confirm */}
                <div>
                  <label htmlFor="confirm" className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A1F2B]/50"
                    />
                    <input
                      id="confirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Type it again"
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value)
                        setError("")
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                    {linkExpired && (
                      <Link
                        href="/auth/forgot-password"
                        className="mt-2 block font-semibold text-[#7A1F2B] hover:underline"
                      >
                        Send me a new link
                      </Link>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save new password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}