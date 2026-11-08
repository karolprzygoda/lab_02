import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
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
  return (
    <Form
      action="/"
      method="get"
      className="min-w-0 flex-1 basis-full sm:basis-80"
    >
      <FieldGroup className="flex flex-row flex-wrap items-end gap-2">
        <Field className="w-auto">
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <OptionSelect
            key={query.status}
            id="status"
            name="status"
            defaultValue={query.status ?? ALL_FILTER_VALUE}
            options={STATUS_FILTER_OPTIONS}
          />
        </Field>
        <Field className="w-auto">
          <FieldLabel htmlFor="channel">Kanał</FieldLabel>
          <OptionSelect
            key={query.channel}
            id="channel"
            name="channel"
            defaultValue={query.channel ?? ALL_FILTER_VALUE}
            options={CHANNEL_FILTER_OPTIONS}
          />
        </Field>
        <Button type="submit" variant="secondary">
          Filtruj
        </Button>
        <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
          Wyczyść
        </Button>
      </FieldGroup>
    </Form>
  )
}
