import { Temporal } from "@js-temporal/polyfill"
import { DomainError } from "../validation/notification.schema"

export function localToInstant(local: string, timezone: string) {
  try {
    return Temporal.PlainDateTime.from(local).toZonedDateTime(timezone, {
      disambiguation: "reject",
    }).epochMilliseconds
  } catch {
    throw new DomainError(
      "Niepoprawna lub niejednoznaczna godzina przy zmianie czasu. Wybierz inną godzinę."
    )
  }
}

export function nextAllowedTime(instant: number, timezone: string) {
  const local =
    Temporal.Instant.fromEpochMilliseconds(instant).toZonedDateTimeISO(timezone)
  if (local.hour >= 8 && local.hour < 22) return instant
  const day = local.hour >= 22 ? local.add({ days: 1 }) : local
  return day.with({
    hour: 8,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  }).epochMilliseconds
}
