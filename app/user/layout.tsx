import UserNavbar from "@/components/UserNavBar"
import UserTypography from "@/components/UserTypography"
import React from "react"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserTypography>
      <UserNavbar />

      {children}
    </UserTypography>
  )
}