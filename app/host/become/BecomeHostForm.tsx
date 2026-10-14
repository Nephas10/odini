"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Phone, Store } from "lucide-react"
import { becomeHost, type BecomeHostState } from "./action"

type Props = {
  defaultName: string
  defaultPhone: string
}

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 pl-11 text-sm text-gray-900 outline-none transition focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/15"

// Only collects input. Saving and the role change happen in actions.ts.
export default function BecomeHostForm({ defaultName, defaultPhone }: Props) {
  const [state, formAction, isPending] = useActionState<BecomeHostState, FormData>(becomeHost, {})
  const [accepted, setAccepted] = useState(false)

  return (
    <form action={formAction} className="space-y-5">
      {/* Business name */}
      <div>
        <label htmlFor="business_name" className="mb-2 block text-sm font-medium text-gray-700">
          Business or host name
        </label>
        <div className="relative">
          <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A1F2B]/50" />
          <input
            id="business_name"
            name="business_name"
            required
            maxLength={80}
            defaultValue={defaultName}
            placeholder="e.g. Lakeside Lodge or Lusaka Jazz Nights"
            className={inputClass}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-500">Guests see this name on your listings.</p>
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
          WhatsApp number for bookings
        </label>
        <div className="relative">
          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A1F2B]/50" />
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={defaultPhone}
            placeholder="+260 97 123 4567"
            className={inputClass}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          Booking requests arrive here on WhatsApp, so make sure it's a number you check.
        </p>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 text-sm text-gray-600">
        <input
          type="checkbox"
          name="accepted_terms"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#7A1F2B]"
        />
        <span>
          I agree to the{" "}
          <Link
            href="/terms#section-4"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#7A1F2B] hover:underline"
          >
            Terms and Conditions
          </Link>
          , including the Partner rules for listings, accuracy and honouring confirmed bookings.
        </span>
      </label>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || !accepted}
        className="w-full rounded-full bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Setting up your host account..." : "Become a host"}
      </button>
    </form>
  )
}