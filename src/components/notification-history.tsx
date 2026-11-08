import { RefreshCw } from "lucide-react"
import { Button } from "./ui/button"
import { Form } from "./ui/form"
import { refreshNotifications } from "@/server/actions"
import { NotificationList } from "@/components/notification-list"
import type { Notification } from "@/server/repositories/notification.repository"
import { NOTIFICATION_LIST_LIMIT } from "@/server/repositories/notification.repository"
import {
  NotificationFilters,
  type NotificationFiltersQuery,
} from "./notification-filters"

export function NotificationHistory({
  items,
  query,
}: {
  items: Notification[]
  query: NotificationFiltersQuery
}) {
  return (
    <section
      aria-labelledby="queue-title"
      className="flex min-w-0 flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="queue-title" className="font-semibold">
          Historia powiadomień
        </h2>
        <p className="text-xs text-muted-foreground">
          Ostatnie {NOTIFICATION_LIST_LIMIT} wpisów
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <NotificationFilters query={query} />
        <Form action={refreshNotifications}>
          <Button type="submit" variant="outline">
            <RefreshCw data-icon="inline-start" />
            Odśwież statusy
          </Button>
        </Form>
      </div>
      <NotificationList items={items} />
    </section>
  )
}
