"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Option = { readonly value: string; readonly label: string }
export function OptionSelect({
  id,
  name,
  options,
  defaultValue,
  onValueChange,
}: {
  id: string
  name?: string
  options: readonly Option[]
  onValueChange?: (value: string) => void
  defaultValue: string
}) {
  return (
    <Select
      onValueChange={(value) => {
        if (value !== null) onValueChange?.(value)
      }}
      name={name}
      defaultValue={defaultValue}
      items={options}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
