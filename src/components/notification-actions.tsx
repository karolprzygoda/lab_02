"use client"

import { changeNotification } from "@/server/actions"
import { ActionForm } from "./action-form"
import { useCloseNotificationDetails } from "./notification-detail-dialog"
import { Button } from "./ui/button"

export function NotificationActions({ id }: { id: string }) {
  const close = useCloseNotificationDetails()
  return (
    <ActionForm
      action={changeNotification}
      className="w-full"
      onSuccess={close ?? undefined}
    >
      {({ pending, action }) => (
        <>
          <input type="hidden" name="id" value={id} />
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              name="action"
              value="send-now"
              size="sm"
              disabled={pending}
              className="grid"
            >
              <span
                className={
                  pending && action === "send-now"
                    ? "invisible col-start-1 row-start-1"
                    : "col-start-1 row-start-1"
                }
              >
                Wyślij teraz
              </span>
              <span
                className={
                  pending && action === "send-now"
                    ? "col-start-1 row-start-1"
                    : "invisible col-start-1 row-start-1"
                }
              >
                Zapisywanie…
              </span>
            </Button>
            <Button
              type="submit"
              name="action"
              value="cancel"
              size="sm"
              variant="outline"
              disabled={pending}
              className="grid"
            >
              <span
                className={
                  pending && action === "cancel"
                    ? "invisible col-start-1 row-start-1"
                    : "col-start-1 row-start-1"
                }
              >
                Anuluj wysyłkę
              </span>
              <span
                className={
                  pending && action === "cancel"
                    ? "col-start-1 row-start-1"
                    : "invisible col-start-1 row-start-1"
                }
              >
                Zapisywanie…
              </span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            „Wyślij teraz” pomija termin i ciszę nocną odbiorcy.
          </p>
        </>
      )}
    </ActionForm>
  )
}
