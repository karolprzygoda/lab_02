import type { NotificationFiltersQuery } from "@/components/notification-filters"
import { NotificationHistory } from "@/components/notification-history"
import { notifications } from "@/server/api/context"
import { connection } from "next/server"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<NotificationFiltersQuery>
}) {
  await connection()
  const query = await searchParams
  const repository = notifications().repository
  const allItems = await repository.list()
  const items = allItems.filter(
    (item) =>
      (!query.status ||
        query.status === "all" ||
        item.status === query.status) &&
      (!query.channel ||
        query.channel === "all" ||
        item.channel === query.channel)
  )
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-8 sm:px-8">
        <NotificationHistory items={items} query={query} />

      </main>
    </div>
  )
}
