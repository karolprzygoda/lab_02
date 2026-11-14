"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "./ui/toast"

type Delivery = {
  id: string
  title: string
  recipient: string
  channel: string
}

export function DeliveredNotifications({
  initialRevision,
}: {
  initialRevision: string
}) {
  const router = useRouter()
  const startedAt = useRef(0)
  const seen = useRef(new Set<string>())
  const revision = useRef(initialRevision)
  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    const controller = new AbortController()
    let errorToast: string | undefined
    async function poll() {
      try {
        const response = await fetch(
          `/api/notifications/delivered?since=${startedAt.current}`,
          { cache: "no-store", signal: controller.signal }
        )
        if (!response.ok) throw new Error("Delivery polling failed")
        const data: { since: number; items: Delivery[]; revision: string } =
          await response.json()
        const items = data.items
        startedAt.current = data.since
        if (stopped) return
        if (revision.current !== data.revision) {
          revision.current = data.revision
          router.refresh()
        }
        if (errorToast) {
          toast.close(errorToast)
          errorToast = undefined
        }
        for (const item of items) {
          if (seen.current.has(item.id)) continue
          seen.current.add(item.id)
          const id = toast.add({
            type: "info",
            title: item.title || "Nowe powiadomienie",
            description: `${item.channel === "email" ? "E-mail" : "Push"} · ${item.recipient}`,
            timeout: 10000,
            actionProps: {
              children: "Pokaż szczegóły",
              onClick() {
                const params = new URLSearchParams(window.location.search)
                params.set("notification", item.id)
                router.push(`/?${params}`, { scroll: false })
                toast.close(id)
              },
            },
          })
        }
      } catch {
        if (!stopped && !errorToast)
          errorToast = toast.add({
            type: "error",
            title: "Nie można odebrać powiadomień",
            description: "Ponowimy połączenie automatycznie.",
          })
      } finally {
        if (!stopped) timer = setTimeout(poll, 3000)
      }
    }
    void poll()
    return () => {
      stopped = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [router])
  return null
}
