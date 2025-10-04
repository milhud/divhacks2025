import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/lib/auth-context"
import "../styles/globals.css"

export const metadata: Metadata = {
  title: "Spottr - AI Fitness Assistant",
  description: "Perfect your form with real-time AI feedback and pose analysis",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
