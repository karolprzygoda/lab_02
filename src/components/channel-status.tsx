"use client"

import Link from "next/link"
import type { NotificationFiltersQuery } from "./notification-filters"

import { useEffect, useState } from "react"
import { Mail, Smartphone, Clock, CircleAlert } from "lucide-react"
import { Badge } from "./ui/badge"

type ChannelState = { channel: string; active: boolean }

export function ChannelStatus({
  initialWorkers,
  initialCounts,
  query,
}: {
  initialWorkers: ChannelState[]
  initialCounts: { status: string; count: number }[]
  query: NotificationFiltersQuery
}) {
  const [workers, setWorkers] = useState(initialWorkers)
  const [counts, setCounts] = useState(initialCounts)
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
        const data: { workers: ChannelState[]; counts: typeof initialCounts } =
          await response.json()
        if (!stopped) {
          setWorkers(data.workers)
          setCounts(data.counts)
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

  function statusHref(status: string) {
    const params = new URLSearchParams({ status })
    if (query.channel && query.channel !== "all")
      params.set("channel", query.channel)
    return `/?${params}`
  }

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-3">
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
      <div className="ml-auto flex flex-wrap justify-end gap-3">
        <Badge
          variant="outline"
          className="notification-status"
          data-status="pending"
          render={<Link href={statusHref("pending")} scroll={false} />}
          aria-current={query.status === "pending" ? "page" : undefined}
        >
          <Clock />W kolejce:{" "}
          {unavailable
            ? "—"
            : (counts.find((item) => item.status === "pending")?.count ?? 0)}
        </Badge>
        <Badge
          variant="outline"
          className="notification-status"
          data-status="failed"
          render={<Link href={statusHref("failed")} scroll={false} />}
          aria-current={query.status === "failed" ? "page" : undefined}
        >
          <CircleAlert />
          Niedoręczone — błąd:{" "}
          {unavailable
            ? "—"
            : (counts.find((item) => item.status === "failed")?.count ?? 0)}
        </Badge>
      </div>
    </div>
  )
}
