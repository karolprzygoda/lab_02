"use client"
import { useState, type Ref } from "react"
import type { FieldError as FormFieldError } from "react-hook-form"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, value) => ({
  value: String(value).padStart(2, "0"),
  label: String(value).padStart(2, "0"),
}))

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, value) => ({
  value: String(value).padStart(2, "0"),
  label: String(value).padStart(2, "0"),
}))

export function ScheduleField({
  value,
  onValueChange,
  onBlur,
  ref,
  error,
}: {
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  ref?: Ref<HTMLButtonElement>
  error?: FormFieldError
}) {
  const day = value.slice(0, 10)
  const hour = value.slice(11, 13)
  const minute = value.slice(14, 16)
  const [open, setOpen] = useState(false)
  const date = new Date(day + "T12:00:00")
  return (
    <FieldGroup>
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="scheduled-date">Data doręczenia</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                id="scheduled-date"
                ref={ref}
                onBlur={onBlur}
                aria-invalid={!!error}
                aria-describedby={error ? "schedule-error" : undefined}
                type="button"
                variant="outline"
                className="w-full justify-start"
              />
            }
          >
            <CalendarIcon data-icon="inline-start" />
            {format(date, "d MMMM yyyy", { locale: pl })}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={pl}
              selected={date}
              defaultMonth={date}
              onSelect={(value) => {
                if (value) {
                  onValueChange(
                    format(value, "yyyy-MM-dd") + "T" + hour + ":" + minute
                  )
                  setOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <FieldGroup className="grid grid-cols-2 gap-3">
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="scheduled-hour">Godzina</FieldLabel>
          <Select
            items={HOUR_OPTIONS}
            value={hour}
            onValueChange={(value) => {
              if (value !== null)
                onValueChange(day + "T" + value + ":" + minute)
            }}
          >
            <SelectTrigger
              aria-invalid={!!error}
              aria-describedby={error ? "schedule-error" : undefined}
              id="scheduled-hour"
              onBlur={onBlur}
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {HOUR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="scheduled-minute">Minuta</FieldLabel>
          <Select
            items={MINUTE_OPTIONS}
            value={minute}
            onValueChange={(value) => {
              if (value !== null) onValueChange(day + "T" + hour + ":" + value)
            }}
          >
            <SelectTrigger
              aria-invalid={!!error}
              aria-describedby={error ? "schedule-error" : undefined}
              id="scheduled-minute"
              onBlur={onBlur}
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MINUTE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <FieldError id="schedule-error" errors={[error]} />
      <FieldDescription>
        Data i godzina lokalna w wybranej strefie odbiorcy.
      </FieldDescription>
    </FieldGroup>
  )
}
