"use client"
import { useId } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { OptionSelect } from "./option-select"

export const ALL_FILTER_VALUE = "all"

const NOTIFICATION_STATUSES = [
  { value: "pending", label: "W kolejce" },
  { value: "sent", label: "Doręczone" },
  { value: "failed", label: "Zakończone błędem" },
  { value: "cancelled", label: "Anulowane" },
] as const

const NOTIFICATION_CHANNELS = [
  { value: "email", label: "E-mail" },
  { value: "push", label: "Push" },
] as const

const STATUS_FILTER_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: "Wszystkie statusy" },
  ...NOTIFICATION_STATUSES,
]

const CHANNEL_FILTER_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: "Wszystkie kanały" },
  ...NOTIFICATION_CHANNELS,
]

export type NotificationFiltersQuery = { status?: string; channel?: string }
export function NotificationFilters({
  query,
}: {
  query: NotificationFiltersQuery
}) {
  const router = useRouter()
  const id = useId()
  function update(name: string, value: string) {
    const params = new URLSearchParams(window.location.search)
    if (value === ALL_FILTER_VALUE) params.delete(name)
    else params.set(name, value)
    router.replace(`/?${params}`, { scroll: false })
  }
  return (
    <div className="min-w-0 flex-1 basis-full sm:basis-80">
      <FieldGroup className="flex flex-row flex-wrap items-end gap-4">
        <Field className="w-auto">
          <FieldLabel htmlFor={id + "-status"}>Status</FieldLabel>
          <OptionSelect
            key={query.status}
            onValueChange={(value) => update("status", value)}
            id={id + "-status"}
            name="status"
            defaultValue={query.status ?? ALL_FILTER_VALUE}
            options={STATUS_FILTER_OPTIONS}
          />
        </Field>
        <Field className="w-auto">
          <FieldLabel htmlFor={id + "-channel"}>Kanał</FieldLabel>
          <OptionSelect
            key={query.channel}
            onValueChange={(value) => update("channel", value)}
            id={id + "-channel"}
            name="channel"
            defaultValue={query.channel ?? ALL_FILTER_VALUE}
            options={CHANNEL_FILTER_OPTIONS}
          />
        </Field>
        <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
          Wyczyść
        </Button>
      </FieldGroup>
    </div>
  )
}
