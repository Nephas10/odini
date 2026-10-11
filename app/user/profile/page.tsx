import { createClient } from "@/lib/supabase/server"

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("firstname, phone_number")
        .eq("id", user.id)
        .single()

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-2xl">
                    <p className="text-red-500">
                        Unable to load profile.
                    </p>
                </div>
            </main>
        )
    }

    return (
    <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">

            {/* Header */}
            <div>
                <p className="text-sm font-medium text-[#e8365d]">
                    Account
                </p>

                <h1 className="mt-1 text-3xl font-bold text-gray-900">
                    My Profile
                </h1>

                <p className="mt-2 text-gray-500">
                    Manage your personal information.
                </p>
            </div>

            {/* Profile Card */}
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

                {/* Avatar */}
                <div className="flex items-center gap-4">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8365d] text-xl font-bold text-white">
                        {profile.firstname?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {profile.firstname}
                        </h2>

                        <p className="text-sm text-gray-500">
                            Odini member
                        </p>
                    </div>

                </div>

                {/* Details */}
                <div className="mt-8 space-y-6">

                    <div>
                        <p className="text-sm text-gray-500">
                            Full Name
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {profile.firstname}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Email
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {user.email}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            WhatsApp Number
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {profile.phone_number}
                        </p>
                    </div>

                </div>

                {/* Edit Button */}
                <div className="mt-8 border-t border-gray-100 pt-6">

                    <button
                        type="button"
                        className="rounded-full bg-[#e8365d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d02d50]"
                    >
                        Edit Profile
                    </button>

                </div>

            </div>

        </div>
    </main>
)
}