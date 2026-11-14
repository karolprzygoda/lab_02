"use client"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Dialog } from "./ui/dialog"

export function NotificationDetailDialog({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          const params = new URLSearchParams(window.location.search)
          params.delete("notification")
          router.replace(`/?${params}`, { scroll: false })
        }
      }}
    >
      {children}
    </Dialog>
  )
}
