"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

export function RefreshNotificationsButton() {
  const { pending } = useFormStatus()
  const [spinning, setSpinning] = useState(false)
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending || spinning}
      aria-busy={pending || spinning}
      onClick={() => {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          setSpinning(true)
      }}
    >
      <RefreshCw
        data-icon="inline-start"
        className={spinning ? "motion-safe:animate-spin" : undefined}
        onAnimationIteration={() => {
          if (!pending) setSpinning(false)
        }}
      />
      Odśwież statusy
    </Button>
  )
}
