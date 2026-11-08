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
}: {
  id: string
  name?: string
  options: readonly Option[]
  defaultValue: string
}) {
  return (
    <Select name={name} defaultValue={defaultValue} items={options}>
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
