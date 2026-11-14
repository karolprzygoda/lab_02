"use client"

import { useEffect, useState } from "react"
import { Mail, Smartphone } from "lucide-react"
import { Badge } from "./ui/badge"

type ChannelState = { channel: string; active: boolean }

export function ChannelStatus({
  initialWorkers,
}: {
  initialWorkers: ChannelState[]
}) {
  const [workers, setWorkers] = useState(initialWorkers)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    const controller = new AbortController()
    async function update() {
      try {
        const response = await fetch("/api/channels", {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) throw new Error("Status unavailable")
        const data: ChannelState[] = await response.json()
        if (!stopped) {
          setWorkers(data)
          setUnavailable(false)
        }
      } catch {
        if (!stopped) setUnavailable(true)
      } finally {
        if (!stopped) timer = setTimeout(update, 60_000)
      }
    }
    void update()
    return () => {
      stopped = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-3" aria-live="polite">
      {(["email", "push"] as const).map((channel) => {
        const active = workers.some(
          (worker) => worker.channel === channel && worker.active
        )
        return (
          <Badge
            key={channel}
            variant="outline"
            className="notification-status"
            data-status={unavailable ? "pending" : active ? "sent" : "failed"}
          >
            {channel === "email" ? <Mail /> : <Smartphone />}
            {channel === "email" ? "E-mail" : "Push"}:{" "}
            {unavailable
              ? "Status niedostępny"
              : active
                ? "Połączono"
                : "Brak połączenia"}
          </Badge>
        )
      })}
      <p className="text-xs text-muted-foreground">
        Status kanałów sprawdzany co minutę.
      </p>
    </div>
  )
}
