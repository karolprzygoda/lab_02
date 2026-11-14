import { notifications } from "@/server/api/context"

export async function GET() {
  try {
    const workers = await notifications().repository.workers()
    return Response.json(
      workers.map(({ channel, active }) => ({ channel, active })),
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
