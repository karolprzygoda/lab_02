import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sygnał · Centrum powiadomień",
  description: "Planowanie i symulacja doręczania powiadomień e-mail i push.",
}
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className="dark scheme-dark">
      <body className="bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
