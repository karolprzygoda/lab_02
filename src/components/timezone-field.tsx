"use client"
import type { Ref } from "react"
import type { FieldError as FormFieldError } from "react-hook-form"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"

export function TimezoneField({
  timezones,
  value,
  onValueChange,
  onBlur,
  ref,
  error,
}: {
  timezones: string[]
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  ref?: Ref<HTMLInputElement>
  error?: FormFieldError
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="timezone">Strefa czasowa odbiorcy</FieldLabel>
      <Combobox
        name="timezone"
        items={timezones}
        value={value}
        onValueChange={(value) => onValueChange(value ?? "")}
        required
      >
        <ComboboxInput
          id="timezone"
          ref={ref}
          onBlur={onBlur}
          placeholder="Wyszukaj strefę…"
          aria-invalid={!!error}
          aria-describedby={error ? "timezone-error" : undefined}
        />
        <ComboboxContent>
          <ComboboxEmpty>Nie znaleziono strefy.</ComboboxEmpty>
          <ComboboxList>
            {(zone: string) => (
              <ComboboxItem key={zone} value={zone}>
                {zone}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError id="timezone-error" errors={[error]} />
    </Field>
  )
}
