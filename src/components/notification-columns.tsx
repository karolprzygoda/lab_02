"use client"

import { Columns3, SlidersHorizontal } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"

export const columns = [
  ["title", "Tytuł"],
  ["recipient", "Odbiorca"],
  ["channel", "Typ kanału"],
  ["priority", "Priorytet"],
  ["status", "Status"],
  ["created", "Termin utworzenia"],
  ["scheduled", "Planowany termin realizacji"],
  ["attempts", "Próby doręczenia"],
] as const

export function NotificationColumns({
  children,
  toolbar,
  filters,
  trailing,
}: {
  children: ReactNode
  toolbar: ReactNode
  filters: ReactNode
  trailing: ReactNode
}) {
  const [hidden, setHidden] = useState<string[]>([])
  const columnOptions = columns.map(([key, label]) => (
    <label key={key} className="flex cursor-pointer items-center gap-3 py-1">
      <Checkbox
        checked={!hidden.includes(key)}
        onCheckedChange={(checked) =>
          setHidden((current) =>
            checked
              ? current.filter((value) => value !== key)
              : [...current, key]
          )
        }
      />
      {label}
    </label>
  ))
  return (
    <div
      className="notification-table flex min-w-0 flex-col gap-6"
      data-hidden={hidden.join(" ")}
    >
      <div className="hidden flex-wrap items-end gap-4 lg:flex">
        {filters}
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            <Columns3 data-icon="inline-start" />
            Kolumny
          </PopoverTrigger>
          <PopoverContent align="end">
            <PopoverTitle>Widoczne kolumny</PopoverTitle>
            {columnOptions}
          </PopoverContent>
        </Popover>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-4">
          {toolbar}
          {trailing}
        </div>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-3 md:flex md:flex-wrap md:items-center lg:hidden [&_button]:h-10 [&_button]:w-full [&_button]:whitespace-nowrap md:[&_button]:w-auto [&>div]:w-full md:[&>div]:w-auto [&>form]:w-full md:[&>form]:w-auto">
        <Drawer showSwipeHandle>
          <DrawerTrigger render={<Button variant="outline" />}>
            <SlidersHorizontal data-icon="inline-start" />
            Filtry
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filtry i kolumny</DrawerTitle>
              <DrawerDescription>
                Dostosuj listę powiadomień. Zmiany są stosowane od razu.
              </DrawerDescription>
            </DrawerHeader>
            <ScrollArea className="min-h-0 flex-1 **:data-[slot=scroll-area-viewport]:max-h-[60dvh]">
              <div className="flex flex-col gap-5 p-4 pr-8">
                <div className="**:data-[slot=field]:w-full **:data-[slot=field-group]:flex-col **:data-[slot=field-group]:items-stretch">
                  {filters}
                </div>
                <Separator />
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-3 text-sm font-medium">
                    Widoczne kolumny
                  </legend>
                  {columnOptions}
                </fieldset>
              </div>
            </ScrollArea>
            <DrawerFooter className="pt-4">
              <DrawerClose render={<Button variant="outline" />}>
                Zamknij
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <div className="grid grid-cols-1 gap-3 md:ml-auto md:flex md:flex-wrap md:items-center md:justify-end">
          {toolbar}
          {trailing}
        </div>
      </div>
      {children}
    </div>
  )
}
