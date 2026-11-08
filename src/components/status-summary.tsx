import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const NOTIFICATION_STATUSES = [
  { value: "pending", label: "W kolejce" },
  { value: "sent", label: "Doręczone" },
  { value: "failed", label: "Zakończone błędem" },
  { value: "cancelled", label: "Anulowane" },
] as const

export function StatusSummary({
  counts,
}: {
  counts: { status: string; count: number }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {NOTIFICATION_STATUSES.map((status) => (
        <Link
          href={`/?status=${status.value}`}
          key={status.value}
          aria-label={`Filtruj: ${status.label}`}
        >
          <Card>
            <CardHeader>
              <CardDescription>{status.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {counts.find((count) => count.status === status.value)?.count ??
                  0}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
