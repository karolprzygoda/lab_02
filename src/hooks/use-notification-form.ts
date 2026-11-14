"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { createNotification } from "@/server/actions"
import {
  notificationSchema,
  type NotificationInput,
} from "@/server/validation/notification.schema"
import { toast } from "@/components/ui/toast"

type NotificationValues = z.output<typeof notificationSchema>

export function useNotificationForm({
  initialId,
  defaultDate,
  onSuccess,
}: {
  initialId: string
  defaultDate: string
  onSuccess?: () => void
}) {
  const defaultValues: NotificationInput = {
    id: initialId,
    title: "",
    content: "",
    recipient: "",
    channel: "email",
    priority: "low",
    timezone: "Europe/Warsaw",
    createdTimezone: "",
    scheduledLocal: defaultDate,
    ignoreQuietHours: false,
    simulateFailures: 0,
  }
  const form = useForm<NotificationInput, unknown, NotificationValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues,
  })
  const { setValue } = form
  useEffect(() => {
    setValue(
      "createdTimezone",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    )
  }, [setValue])

  const submit = form.handleSubmit(
    async (values) => {
      const data = new FormData()
      for (const [key, value] of Object.entries(values)) {
        if (typeof value === "boolean") {
          if (value) data.set(key, "on")
        } else {
          data.set(key, String(value))
        }
      }
      try {
        const result = await createNotification({}, data)
        if (result.error) {
          for (const [name, messages] of Object.entries(
            result.fieldErrors ?? {}
          )) {
            if (Object.hasOwn(notificationSchema.shape, name)) {
              form.setError(name as keyof NotificationInput, {
                type: "server",
                message: messages.join(" "),
              })
            }
          }
          toast.add({
            type: "error",
            title: "Nie udało się utworzyć powiadomienia",
            description: result.error,
          })
          return
        }
        if (result.success) {
          toast.add({ type: "success", title: result.success })
          form.reset({
            ...defaultValues,
            id: crypto.randomUUID(),
            createdTimezone: form.getValues("createdTimezone"),
          })
          onSuccess?.()
        }
      } catch {
        toast.add({
          type: "error",
          title: "Nie udało się połączyć z serwerem",
          description: "Wpisane dane zostały zachowane. Spróbuj ponownie.",
        })
      }
    },
    () => {
      toast.add({ type: "error", title: "Sprawdź zaznaczone pola." })
    }
  )

  return { form, submit }
}
