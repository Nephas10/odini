
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/supabase"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogout() {
    setLoading(true)
    setError("")

    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      setError("Unable to log out. Please try again.")
      setLoading(false)
      return
    }

    router.replace("/")
    router.refresh()
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 rounded-full border border-[#7A1F2B]/20 px-4 py-2.5 text-sm font-semibold text-[#7A1F2B] transition hover:bg-[#F7EDEF] disabled:opacity-50"
      >
        <LogOut size={16} />
        {loading ? "Logging out..." : "Log out"}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
