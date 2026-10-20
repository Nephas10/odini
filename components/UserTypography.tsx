import { Inter, Outfit } from "next/font/google"
import type { ReactNode } from "react"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
})

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--odini-font-display",
  fallback: ["system-ui", "sans-serif"],
})

// Applied only by the guest layout; global and monospace fonts remain untouched.
export default function UserTypography({ children }: { children: ReactNode }) {
  return (
    <div className={`odini-user-typography ${inter.className} ${outfit.variable}`}>
      {/* Guest-scoped contract: main row + mobile tabs + borders; top inset is added once by the header. */}
      <style>{`
        .odini-user-typography {
          --odini-user-header-height: calc(4.75rem + 20.5px + env(safe-area-inset-top, 0px));
        }
        @media (min-width: 48rem) {
          .odini-user-typography {
            --odini-user-header-height: calc(3.5rem + 1px + env(safe-area-inset-top, 0px));
          }
        }
      `}</style>
      {children}
    </div>
  )
}
