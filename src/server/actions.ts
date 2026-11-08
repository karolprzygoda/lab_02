"use server"
import { revalidatePath } from "next/cache"
import { notifications } from "@/server/api/context"
import { DomainError } from "@/server/validation/notification.schema"

export type ActionState = { error?: string; success?: string }

export async function createNotification(
  _state: ActionState,
  data: FormData
): Promise<ActionState> {
  try {
    await notifications().create(Object.fromEntries(data))
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message }
    console.error(error)
    return { error: "Nie udało się zapisać powiadomienia. Spróbuj ponownie." }
  }
  revalidatePath("/")
  return { success: "Powiadomienie zapisane. Zaplanuj kolejne poniżej." }
}
export async function changeNotification(
  _state: ActionState,
  data: FormData
): Promise<ActionState> {
  const action = data.get("action")
  if (action !== "cancel" && action !== "send-now")
    return { error: "Niepoprawna operacja." }
  try {
    await notifications().change(String(data.get("id")), action)
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message }
    console.error(error)
    return { error: "Nie udało się zmienić powiadomienia." }
  }
  revalidatePath("/")
  return {
    success:
      action === "cancel"
        ? "Wysyłka anulowana."
        : "Przekazano do natychmiastowej wysyłki.",
  }
}
export async function refreshNotifications() {
  revalidatePath("/")
}
