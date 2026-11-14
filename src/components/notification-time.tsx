"use client"

import { useEffect, useRef, useState } from "react"
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip"

export function NotificationTime({
  timestamp,
  timezone,
  timezoneLabel = "Strefa czasowa odbiorcy",
}: {
  timestamp: number
  timezone: string
  timezoneLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const touching = useRef(false)
  const origin = useRef({ x: 0, y: 0 })
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  function cancelHold() {
    clearTimeout(holdTimer.current)
  }
  useEffect(
    () => () => {
      clearTimeout(holdTimer.current)
      clearTimeout(closeTimer.current)
    },
    []
  )
  return (
    <Tooltip
      open={open}
      onOpenChange={(next) => {
        if (!next || !touching.current) setOpen(next)
      }}
    >
      <TooltipTrigger
        className="cursor-help touch-pan-x touch-pan-y rounded-sm underline decoration-dotted underline-offset-4 select-none"
        onTouchStart={(event) => {
          touching.current = true
          clearTimeout(closeTimer.current)
          cancelHold()
          setOpen(false)
          origin.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          }
          holdTimer.current = setTimeout(() => setOpen(true), 500)
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0]
          if (
            Math.hypot(
              touch.clientX - origin.current.x,
              touch.clientY - origin.current.y
            ) > 10
          ) {
            cancelHold()
            setOpen(false)
          }
        }}
        onTouchEnd={() => {
          cancelHold()
          closeTimer.current = setTimeout(() => {
            touching.current = false
            setOpen(false)
          }, 3000)
        }}
        onTouchCancel={() => {
          cancelHold()
          touching.current = false
          setOpen(false)
        }}
        onContextMenu={(event) => {
          if (touching.current) event.preventDefault()
        }}
      >
        <time dateTime={new Date(timestamp).toISOString()}>
          {new Intl.DateTimeFormat("pl-PL", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: timezone,
          }).format(timestamp)}
        </time>
      </TooltipTrigger>
      <TooltipContent>
        {timezoneLabel}: {timezone}
      </TooltipContent>
    </Tooltip>
  )
}
