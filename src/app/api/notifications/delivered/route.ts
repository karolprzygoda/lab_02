import { getDatabase } from "@/server/db"
import { NotificationRepository } from "@/server/repositories/notification.repository"
import { notificationRevision } from "@/server/services/notification-revision"

export async function GET(request: Request) {
  const since = Number(new URL(request.url).searchParams.get("since"))
  if (!Number.isFinite(since) || since < 0)
    return Response.json({ error: "Niepoprawny termin." }, { status: 400 })
  const startedAt = since || Date.now()
  try {
    const db = getDatabase()
    const repository = new NotificationRepository(db)
    const [items, notifications, counts] = await Promise.all([
      since === 0
        ? Promise.resolve([])
        : db.notification.findMany({
            where: { status: "sent", sent_at: { gte: new Date(since) } },
            orderBy: [{ sent_at: "asc" }, { id: "asc" }],
            select: { id: true, title: true, recipient: true, channel: true },
          }),
      repository.list(),
      repository.counts(),
    ])
    return Response.json(
      {
        since: startedAt,
        items,
        revision: notificationRevision(notifications, counts),
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return Response.json(
      { error: "Nie udało się pobrać doręczeń." },
      { status: 503 }
    )
  }
}
