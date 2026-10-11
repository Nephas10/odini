
"use client"

import { FormEvent, useState } from "react"
import { signupAction } from "../action"
import Image from "next/image"

export default function SignUp() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = await signupAction({
        name,
        email,
        phone,
        password,
    })

    if (!result.success) {
        alert(result.error)
        return
    }

    alert("Account created successfully!")

    window.location.href = "/user"
}
    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10">

            <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">

                <div className="w-full">

                    {/* Brand */}
                    <div className="mb-8 text-center">

                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8365d]">
                            <span className="text-xl font-bold text-white">
                                <Image
                                 src="/odini.jpeg"
                                 alt="logo"
                                 height={100}
                                 width={100}
                                 />
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Odini
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Discover stays, events and activities.
                        </p>

                    </div>


                    {/* Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">

                        <div className="mb-7">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Join Odini and start discovering experiences.
                            </p>
                        </div>


                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#e8365d] focus:ring-2 focus:ring-[#e8365d]/10 text-gray-900"
                                />
                            </div>


                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#e8365d] focus:ring-2 focus:ring-[#e8365d]/10 text-gray-900"
                                />
                            </div>


                            {/* Phone */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    WhatsApp Number
                                </label>

                                <input
                                    type="tel"
                                    placeholder="+260 97 123 4567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#e8365d] focus:ring-2 focus:ring-[#e8365d]/10 text-gray-900"
                                />
                            </div>


                            {/* Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#e8365d] focus:ring-2 focus:ring-[#e8365d]/10 text-gray-900"
                                />
                            </div>


                            {/* Button */}
                            <button
                                type="submit"
                                className="w-full rounded-full bg-[#e8365d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d02d50]"
                            >
                                Create Account
                            </button>

                        </form>


                        {/* Login */}
                        <div className="mt-7 border-t border-gray-100 pt-6 text-center">

                            <span className="text-sm text-gray-500">
                                Already have an account?{" "}
                            </span>

                            <a
                                href="/auth/login"
                                className="text-sm font-semibold text-[#e8365d] hover:text-[#d02d50] hover:underline"
                            >
                                Log in
                            </a>

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
