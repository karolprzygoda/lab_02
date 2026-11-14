"use client"
import { useActionState, useEffect, useRef, type ReactNode } from "react"
import type { ActionState } from "@/server/actions"
import { Form } from "./ui/form"
import { toast } from "./ui/toast"

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: ActionState, data: FormData) => Promise<ActionState>
  children: ReactNode
  className?: string
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const lastState = useRef(state)
  useEffect(() => {
    if (lastState.current === state) return
    lastState.current = state
    if (state.error)
      toast.add({
        type: "error",
        title: "Nie udało się wykonać operacji",
        description: state.error,
      })
    else if (state.success) toast.add({ type: "success", title: state.success })
  }, [state])
  return (
    <Form action={formAction} className={className}>
      <fieldset
        disabled={pending}
        className="flex min-w-0 flex-col gap-4 disabled:opacity-60"
      >
        {children}
      </fieldset>
      <div aria-live="polite" role="status" className="mt-3">
        {pending ? (
          <p className="text-sm text-muted-foreground">Zapisywanie…</p>
        ) : null}
      </div>
    </Form>
  )
}
