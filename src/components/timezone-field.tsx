"use client"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldLabel } from "@/components/ui/field"

export function TimezoneField({
  timezones,
  defaultValue,
}: {
  timezones: string[]
  defaultValue: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor="timezone">Strefa czasowa odbiorcy</FieldLabel>
      <Combobox
        name="timezone"
        items={timezones}
        defaultValue={defaultValue}
        required
      >
        <ComboboxInput id="timezone" placeholder="Wyszukaj strefę…" />
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
    </Field>
  )
}
