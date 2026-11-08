import { z } from "zod"

export class DomainError extends Error {}

export const notificationSchema = z
  .object({
    id: z.uuid(),
    content: z
      .string()
      .trim()
      .min(1, "Wpisz treść wiadomości.")
      .max(2000, "Treść może mieć do 2000 znaków."),
    recipient: z.string().trim().min(1, "Podaj odbiorcę.").max(254),
    channel: z.enum(["email", "push"]),
    timezone: z
      .string()
      .max(100)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("pl", { timeZone: value })
          return !/^[+-]/.test(value)
        } catch {
          return false
        }
      }, "Wybierz poprawną strefę czasową IANA."),
    priority: z.enum(["low", "high"]),
    scheduledLocal: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Podaj datę i godzinę."),
    simulateFailures: z.coerce.number().int().min(0).max(3).default(0),
  })
  .superRefine((data, ctx) => {
    if (
      data.channel === "email" &&
      !z.email().safeParse(data.recipient).success
    )
      ctx.addIssue({
        code: "custom",
        path: ["recipient"],
        message: "Podaj poprawny adres e-mail.",
      })
  })
export type NotificationInput = z.input<typeof notificationSchema>
