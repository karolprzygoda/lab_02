"use client"

import type { Ref } from "react"

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
  value,
  onBlur,
  ref,
  onValueChange,
}: {
  id: string
  name?: string
  options: readonly Option[]
  onValueChange?: (value: string) => void
  defaultValue?: string
  value?: string
  onBlur?: () => void
  ref?: Ref<HTMLButtonElement>
}) {
  return (
    <Select
      onValueChange={(value) => {
        if (value !== null) onValueChange?.(value)
      }}
      name={name}
      defaultValue={defaultValue}
      value={value}
      items={options}
    >
      <SelectTrigger ref={ref} onBlur={onBlur} id={id} className="w-full">
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
