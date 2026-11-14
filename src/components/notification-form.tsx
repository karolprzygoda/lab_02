import { randomUUID } from "node:crypto"
import { Temporal } from "@js-temporal/polyfill"
import { NotificationFormFields } from "./notification-form-fields"

export function NotificationForm() {
  const defaultDate = Temporal.Now.zonedDateTimeISO("Europe/Warsaw")
    .add({ minutes: 5 })
    .toPlainDateTime()
    .toString()
    .slice(0, 16)
  return (
    <NotificationFormFields
      initialId={randomUUID()}
      defaultDate={defaultDate}
    />
  )
}
