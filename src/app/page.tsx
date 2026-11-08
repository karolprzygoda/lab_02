import { connection } from "next/server"
import { NotificationForm } from "@/components/notification-form"
import { StatusSummary } from "@/components/status-summary"
import { NotificationHistory } from "@/components/notification-history"
import type { NotificationFiltersQuery } from "@/components/notification-filters"
import { ALL_FILTER_VALUE } from "@/components/notification-filters"
import { notifications } from "@/server/api/context"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<NotificationFiltersQuery>
}) {
  await connection()
  const query = await searchParams
  const repository = notifications().repository
  const [allItems, counts] = await Promise.all([
    repository.list(),
    repository.counts(),
  ])
  const items = allItems.filter(
    (item) =>
      (!query.status ||
        query.status === ALL_FILTER_VALUE ||
        item.status === query.status) &&
      (!query.channel ||
        query.channel === ALL_FILTER_VALUE ||
        item.channel === query.channel)
  )
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-8">
        <h1 className="sr-only">Powiadomienia</h1>
        <StatusSummary counts={counts} />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.3fr)]">
          <NotificationForm />
          <NotificationHistory items={items} query={query} />
        </div>
      </main>
    </div>
  )
}
