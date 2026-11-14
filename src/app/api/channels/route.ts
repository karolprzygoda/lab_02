import { notifications } from "@/server/api/context"

export async function GET() {
  try {
    const repository = notifications().repository
    const [workers, counts] = await Promise.all([
      repository.workers(),
      repository.counts(),
    ])
    return Response.json(
      {
        workers: workers.map(({ channel, active }) => ({ channel, active })),
        counts,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    )
  } catch {
    return Response.json(
      { error: "Nie można sprawdzić kanałów." },
      { status: 503 }
    )
  }
}
