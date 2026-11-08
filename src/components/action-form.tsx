"use client"
import { useActionState, type ReactNode } from "react"
import type { ActionState } from "@/server/actions"
import { Form } from "./ui/form"
import { Alert, AlertDescription } from "./ui/alert"

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
        {state.error || state.success ? (
          <Alert variant={state.error ? "destructive" : "default"}>
            <AlertDescription>{state.error ?? state.success}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </Form>
  )
}
