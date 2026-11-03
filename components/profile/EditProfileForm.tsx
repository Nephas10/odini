
"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import {
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Save,
  X,
} from "lucide-react"

import { updateProfileAction } from "@/app/user/profile/action"

type Props = {
  initialName: string
  initialPhone: string
}

export default function EditProfileForm({
  initialName,
  initialPhone,
}: Props) {
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function startEditing() {
    setName(initialName === "Odini member" ? "" : initialName)
    setPhone(initialPhone === "Not provided" ? "" : initialPhone)

    setError("")
    setSuccess("")
    setIsEditing(true)
  }

  function cancelEditing() {
    if (saving) return

    setError("")
    setIsEditing(false)
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (saving) return

    setError("")
    setSuccess("")

    if (name.trim().length < 2) {
      setError("Please enter your full name.")
      return
    }

    if (!phone.trim()) {
      setError("Please enter your WhatsApp number.")
      return
    }

    setSaving(true)

    try {
      const result = await updateProfileAction({
        name,
        phone,
      })

      if (!result.success) {
        setError(
          result.error ||
            "Unable to save your changes."
        )
        return
      }

      setIsEditing(false)
      setSuccess("Your profile has been updated successfully.")

      // Reload the updated server-side information
      router.refresh()
    } catch (err) {
      console.error("Profile save error:", err)

      setError(
        "Something went wrong while saving your profile."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-7">

      {/* Header and edit button */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h3 className="text-lg font-bold text-white">
            Manage your details
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/50">
            Keep your contact information up to date.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-2 rounded-full bg-[#e8365d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d02d50]"
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}

      </div>

      {/* Success message */}
      {success && !isEditing && (
        <div
          role="status"
          className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          <CheckCircle2
            size={18}
            className="shrink-0"
          />
          {success}
        </div>
      )}

      {/* Editing form */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-[#242024] p-5 sm:p-6"
          noValidate
        >

          {/* Full name */}
          <div>
            <label
              htmlFor="edit-profile-name"
              className="mb-2 block text-sm font-semibold text-white/80"
            >
              Full name
            </label>

            <input
              id="edit-profile-name"
              type="text"
              autoComplete="name"
              value={name}
              maxLength={100}
              disabled={saving}
              onChange={(event) => {
                setName(event.target.value)
                setError("")
              }}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-white/10 bg-[#1C1A1D] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#e8365d] focus:ring-2 focus:ring-[#e8365d]/15 disabled:opacity-60"
            />
          </div>

          {/* WhatsApp number */}
          <div>
            <label
              htmlFor="edit-profile-phone"
              className="mb-2 block text-sm font-semibold text-white/80"
            >
              WhatsApp number
            </label>

            <input
              id="edit-profile-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              disabled={saving}
              onChange={(event) => {
                setPhone(event.target.value)
                setError("")
              }}
              placeholder="+260 97 123 4567"
              className="w-full rounded-xl border border-white/10 bg-[#1C1A1D] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#e8365d] focus:ring-2 focus:ring-[#e8365d]/15 disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-white/35">
              Use your active WhatsApp number, including
              the country code when possible.
            </p>
          </div>

          {/* Email explanation */}
          <p className="rounded-xl border border-white/10 bg-[#1C1A1D] px-4 py-3 text-xs leading-6 text-white/45">
            Your email address is managed through
            account authentication and cannot be
            changed in this form.
          </p>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8365d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d02d50] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save changes
                </>
              )}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={cancelEditing}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              <X size={17} />
              Cancel
            </button>

          </div>

        </form>
      )}
    </div>
  )
}
