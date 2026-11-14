import { getDatabase } from "@/server/db"

export async function GET(request: Request) {
  const since = Number(new URL(request.url).searchParams.get("since"))
  if (!Number.isFinite(since) || since < 0)
    return Response.json({ error: "Niepoprawny termin." }, { status: 400 })
  if (since === 0)
    return Response.json(
      { since: Date.now(), items: [] },
      { headers: { "Cache-Control": "no-store" } }
    )
  try {
    const items = await getDatabase().notification.findMany({
      where: { status: "sent", sent_at: { gte: new Date(since) } },
      orderBy: [{ sent_at: "asc" }, { id: "asc" }],
      select: { id: true, title: true, recipient: true, channel: true },
    })
    return Response.json(
      { since, items },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return Response.json(
      { error: "Nie udało się pobrać doręczeń." },
      { status: 503 }
    )
  }
}
