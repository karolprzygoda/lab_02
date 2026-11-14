import { DeliveredNotifications } from "@/components/delivered-notifications"
import { NotificationDetailDialog } from "@/components/notification-detail-dialog"
import { NotificationDetails } from "@/components/notification-details"
import { ChannelStatus } from "@/components/channel-status"
import { Separator } from "@/components/ui/separator"
import type { NotificationFiltersQuery } from "@/components/notification-filters"
import { NotificationHistory } from "@/components/notification-history"
import { notifications } from "@/server/api/context"
import { connection } from "next/server"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<NotificationFiltersQuery & { notification?: string }>
}) {
  await connection()
  const query = await searchParams
  const repository = notifications().repository
  const [allItems, workers, counts] = await Promise.all([
    repository.list(),
    repository.workers(),
    repository.counts(),
  ])
  const selected =
    query.notification && /^[0-9a-f-]{36}$/i.test(query.notification)
      ? await repository.get(query.notification)
      : null
  const selectedHistory = selected ? await repository.history(selected.id) : []
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
        <DeliveredNotifications />
        {selected ? (
          <NotificationDetailDialog key={selected.id} linked>
            <NotificationDetails item={selected} history={selectedHistory} />
          </NotificationDetailDialog>
        ) : null}
        <NotificationHistory items={items} query={query} />
        <footer
          className="mt-auto flex flex-col gap-4 pt-6"
          aria-label="Status kanałów komunikacji"
        >
          <Separator />
          <ChannelStatus
            key={JSON.stringify(counts)}
            initialCounts={counts}
            query={query}
            initialWorkers={workers.map(({ channel, active }) => ({
              channel,
              active,
            }))}
          />
        </footer>
      </main>
    </div>
  )
}
