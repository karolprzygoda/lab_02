"use client"
import { useState } from "react"
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

export function ScheduleField({ defaultValue }: { defaultValue: string }) {
  const [day, setDay] = useState(defaultValue.slice(0, 10))
  const [hour, setHour] = useState(defaultValue.slice(11, 13))
  const [minute, setMinute] = useState(defaultValue.slice(14, 16))
  const [open, setOpen] = useState(false)
  const date = new Date(day + "T12:00:00")
  return (
    <FieldGroup>
      <input
        type="hidden"
        name="scheduledLocal"
        value={day + "T" + hour + ":" + minute}
      />
      <Field>
        <FieldLabel htmlFor="scheduled-date">Data doręczenia</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                id="scheduled-date"
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
                  setDay(format(value, "yyyy-MM-dd"))
                  setOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <FieldGroup className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="scheduled-hour">Godzina</FieldLabel>
          <Select
            items={HOUR_OPTIONS}
            value={hour}
            onValueChange={(value) => {
              if (value !== null) setHour(value)
            }}
          >
            <SelectTrigger id="scheduled-hour" className="w-full">
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
        <Field>
          <FieldLabel htmlFor="scheduled-minute">Minuta</FieldLabel>
          <Select
            items={MINUTE_OPTIONS}
            value={minute}
            onValueChange={(value) => {
              if (value !== null) setMinute(value)
            }}
          >
            <SelectTrigger id="scheduled-minute" className="w-full">
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
      <FieldDescription>
        Data i godzina lokalna w wybranej strefie odbiorcy.
      </FieldDescription>
    </FieldGroup>
  )
}
