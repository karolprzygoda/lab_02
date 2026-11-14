"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

export function CreationTimezone() {
  const timezone = useSyncExternalStore(
    subscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => ""
  )
  return <input type="hidden" name="createdTimezone" value={timezone} />
}
