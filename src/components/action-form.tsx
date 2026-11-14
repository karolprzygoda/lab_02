"use client"

import { useTransition, useRef, useState, type ReactNode } from "react"
import type { ActionState } from "@/server/actions"
import { Form } from "./ui/form"
import { toast } from "./ui/toast"

export function ActionForm({
  action,
  children,
  className,
  onSuccess,
}: {
  action: (state: ActionState, data: FormData) => Promise<ActionState>
  children:
    | ReactNode
    | ((state: { pending: boolean; action: string | null }) => ReactNode)
  className?: string
  onSuccess?: () => void
}) {
  const [pending, startTransition] = useTransition()
  const submitting = useRef(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  return (
    <Form
      className={className}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (submitting.current) return
        const form = event.currentTarget
        const submitter = (event.nativeEvent as SubmitEvent).submitter
        const data = new FormData(form, submitter)
        submitting.current = true
        setActiveAction(data.get("action")?.toString() ?? null)
        startTransition(async () => {
          let result: ActionState
          try {
            result = await action({}, data)
          } catch {
            result = {
              error: "Nie udało się połączyć z serwerem. Spróbuj ponownie.",
            }
          } finally {
            submitting.current = false
          }
          if (result.error) {
            toast.add({
              type: "error",
              title: "Nie udało się wykonać operacji",
              description: result.error,
            })
          } else if (result.success) {
            toast.add({ type: "success", title: result.success })
            onSuccess?.()
          }
        })
      }}
    >
      <fieldset
        disabled={pending}
        className="flex min-w-0 flex-col gap-4 disabled:opacity-60"
      >
        {typeof children === "function"
          ? children({ pending, action: activeAction })
          : children}
      </fieldset>
    </Form>
  )
}
