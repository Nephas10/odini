import UserNavbar from "@/components/UserNavBar"
import { Geist, Geist_Mono } from "next/font/google"
import React from "react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <UserNavbar />

      {children}
    </>
  )
}