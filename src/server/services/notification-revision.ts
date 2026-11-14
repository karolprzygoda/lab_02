import { createHash } from "node:crypto"
type RevisionItem = {
  id: string
  status: string
  attempts: number
  available_at: number
  sent_at: number | null
}

// Ignore heartbeats and other changes that cannot affect the notification view.
export function notificationRevision(
  items: RevisionItem[],
  counts: { status: string; count: number }[]
) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        items.map((item) => [
          item.id,
          item.status,
          item.attempts,
          item.available_at,
          item.sent_at,
        ]),
        [...counts].sort((a, b) => a.status.localeCompare(b.status)),
      ])
    )
    .digest("hex")
}
