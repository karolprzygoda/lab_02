"use client"

import { useContext } from "react"
import { Controller } from "react-hook-form"
import { useNotificationForm } from "@/hooks/use-notification-form"
import { NotificationCreateCloseContext } from "./notification-create"
import { Moon, Send } from "lucide-react"
import { Form } from "./ui/form"
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
  FieldError,
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

export function NotificationFormFields({
  initialId,
  defaultDate,
}: {
  initialId: string
  defaultDate: string
}) {
  const close = useContext(NotificationCreateCloseContext)
  const { form, submit } = useNotificationForm({
    initialId,
    defaultDate,
    onSuccess: close ?? undefined,
  })
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form
  return (
    <Form noValidate onSubmit={submit}>
      <fieldset disabled={isSubmitting} className="min-w-0 disabled:opacity-60">
        <FieldGroup>
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Tytuł powiadomienia</FieldLabel>
            <Input
              id="title"
              {...register("title")}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              required
              maxLength={200}
              placeholder="Np. Przypomnienie o spotkaniu"
            />
            <FieldError id="title-error" errors={[errors.title]} />
          </Field>
          <Field data-invalid={!!errors.content}>
            <FieldLabel htmlFor="content">Treść wiadomości</FieldLabel>
            <Textarea
              id="content"
              {...register("content")}
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? "content-error" : undefined}
              required
              maxLength={2000}
              rows={4}
              placeholder="Treść powiadomienia…"
            />
            <FieldError id="content-error" errors={[errors.content]} />
          </Field>
          <FieldGroup className="grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="new-channel">Kanał</FieldLabel>
              <Controller
                name="channel"
                control={control}
                render={({ field }) => (
                  <OptionSelect
                    id="new-channel"
                    name={field.name}
                    options={NOTIFICATION_CHANNELS}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="priority">Priorytet</FieldLabel>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <OptionSelect
                    id="priority"
                    name={field.name}
                    options={NOTIFICATION_PRIORITIES}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </Field>
          </FieldGroup>
          <Field data-invalid={!!errors.recipient}>
            <FieldLabel htmlFor="recipient">Odbiorca</FieldLabel>
            <Input
              id="recipient"
              {...register("recipient")}
              aria-invalid={!!errors.recipient}
              aria-describedby={
                errors.recipient ? "recipient-error" : undefined
              }
              required
              maxLength={254}
              placeholder="Adres e-mail lub identyfikator push"
            />
            <FieldError id="recipient-error" errors={[errors.recipient]} />
          </Field>
          <Controller
            name="timezone"
            control={control}
            render={({ field, fieldState }) => (
              <TimezoneField
                timezones={TIMEZONE_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error}
              />
            )}
          />
          <Controller
            name="scheduledLocal"
            control={control}
            render={({ field, fieldState }) => (
              <ScheduleField
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={fieldState.error}
              />
            )}
          />
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
                    <Controller
                      name="ignoreQuietHours"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="ignore-quiet-hours"
                          name={field.name}
                          checked={field.value === true}
                          onCheckedChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      )}
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
                    <FieldLabel htmlFor="failures">
                      Początkowe awarie
                    </FieldLabel>
                    <Controller
                      name="simulateFailures"
                      control={control}
                      render={({ field }) => (
                        <OptionSelect
                          id="failures"
                          name={field.name}
                          options={SIMULATION_FAILURE_OPTIONS}
                          value={String(field.value)}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      )}
                    />
                  </Field>
                </FieldGroup>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Send data-icon="inline-start" />
            {isSubmitting ? "Zapisywanie…" : "Zaplanuj powiadomienie"}
          </Button>
        </FieldGroup>
      </fieldset>
    </Form>
  )
}
