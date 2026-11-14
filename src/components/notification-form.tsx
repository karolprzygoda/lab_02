import { CreationTimezone } from "./creation-timezone"
import { randomUUID } from "node:crypto"
import { Temporal } from "@js-temporal/polyfill"
import { Moon, Send } from "lucide-react"
import { createNotification } from "@/server/actions"
import { ActionForm } from "./action-form"
import { OptionSelect } from "./option-select"
import { ScheduleField } from "./schedule-field"
import { TimezoneField } from "./timezone-field"
import { Checkbox } from "./ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldDescription,
} from "./ui/field"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Alert, AlertTitle, AlertDescription } from "./ui/alert"
import { Button } from "./ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion"

const DEFAULT_TIMEZONE = "Europe/Warsaw"

const DEFAULT_SCHEDULE_DELAY_MINUTES = 5

const NOTIFICATION_CHANNELS = [
  { value: "email", label: "E-mail" },
  { value: "push", label: "Push" },
] as const

const NOTIFICATION_PRIORITIES = [
  { value: "low", label: "Niski" },
  { value: "high", label: "Wysoki" },
] as const

const SIMULATION_FAILURE_OPTIONS = [
  { value: "0", label: "0 — sukces przy pierwszej próbie" },
  { value: "1", label: "1 — sukces przy drugiej próbie" },
  { value: "2", label: "2 — sukces przy trzeciej próbie" },
  { value: "3", label: "3 — zakończenie błędem" },
] as const

const TIMEZONE_OPTIONS = Array.from(
  new Set([DEFAULT_TIMEZONE, "UTC", ...Intl.supportedValuesOf("timeZone")])
)

export function NotificationForm() {
  const id = randomUUID()
  const defaultDate = Temporal.Now.zonedDateTimeISO(DEFAULT_TIMEZONE)
    .add({ minutes: DEFAULT_SCHEDULE_DELAY_MINUTES })
    .toPlainDateTime()
    .toString()
    .slice(0, 16)
  return (
    <ActionForm action={createNotification}>
      <FieldGroup key={id}>
        <input type="hidden" name="id" value={id} />
        <CreationTimezone />
        <Field>
          <FieldLabel htmlFor="title">Tytuł powiadomienia</FieldLabel>
          <Input
            id="title"
            name="title"
            required
            maxLength={200}
            placeholder="Np. Przypomnienie o spotkaniu"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="content">Treść wiadomości</FieldLabel>
          <Textarea
            id="content"
            name="content"
            required
            maxLength={2000}
            rows={4}
            placeholder="Treść powiadomienia…"
          />
        </Field>
        <FieldGroup className="grid sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="new-channel">Kanał</FieldLabel>
            <OptionSelect
              id="new-channel"
              name="channel"
              options={NOTIFICATION_CHANNELS}
              defaultValue="email"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="priority">Priorytet</FieldLabel>
            <OptionSelect
              id="priority"
              name="priority"
              options={NOTIFICATION_PRIORITIES}
              defaultValue="low"
            />
          </Field>
        </FieldGroup>
        <Field>
          <FieldLabel htmlFor="recipient">Odbiorca</FieldLabel>
          <Input
            id="recipient"
            name="recipient"
            required
            maxLength={254}
            placeholder="Adres e-mail lub identyfikator push"
          />
        </Field>
        <TimezoneField
          timezones={TIMEZONE_OPTIONS}
          defaultValue={DEFAULT_TIMEZONE}
        />
        <ScheduleField defaultValue={defaultDate} />
        <Alert>
          <Moon />
          <AlertTitle>Cisza nocna: 22:00–08:00</AlertTitle>
          <AlertDescription>
            Domyślnie wiadomości zaplanowane na noc doręczymy o 08:00 czasu
            odbiorcy. Możesz to zmienić w opcjach symulacji.
          </AlertDescription>
        </Alert>
        <Accordion>
          <AccordionItem value="simulation">
            <AccordionTrigger>Opcje symulacji</AccordionTrigger>
            <AccordionContent keepMounted>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Checkbox
                    id="ignore-quiet-hours"
                    name="ignoreQuietHours"
                    value="on"
                    defaultChecked={false}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="ignore-quiet-hours">
                      Pomiń ciszę nocną
                    </FieldLabel>
                    <FieldDescription>
                      Doręcz w wybranym terminie, również między 22:00 a 08:00
                      czasu odbiorcy. Dotyczy także ponownych prób.
                    </FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="failures">Początkowe awarie</FieldLabel>
                  <OptionSelect
                    id="failures"
                    name="simulateFailures"
                    options={SIMULATION_FAILURE_OPTIONS}
                    defaultValue="0"
                  />
                </Field>
              </FieldGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Button type="submit" className="w-full">
          <Send data-icon="inline-start" />
          Zaplanuj powiadomienie
        </Button>
      </FieldGroup>
    </ActionForm>
  )
}
