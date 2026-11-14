import { NotificationColumns } from "./notification-columns"
import { NotificationCreate } from "./notification-create"
import { NotificationForm } from "./notification-form"
import { RefreshNotificationsButton } from "./refresh-notifications-button"
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
      className="flex min-w-0 flex-col gap-6"
    >
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="queue-title"
            className="text-2xl font-semibold tracking-tight"
          >
            Historia powiadomień
          </h2>
          <p className="text-sm text-muted-foreground">
            Przeglądaj zaplanowane wiadomości i sprawdzaj przebieg ich
            doręczenia.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Ostatnie {NOTIFICATION_LIST_LIMIT} wpisów
        </p>
      </div>
      <NotificationColumns
        trailing={
          <NotificationCreate>
            <NotificationForm />
          </NotificationCreate>
        }
        filters={<NotificationFilters query={query} />}
        toolbar={
          <>
            <Form action={refreshNotifications}>
              <RefreshNotificationsButton />
            </Form>
          </>
        }
      >
        <NotificationList items={items} query={query} />
      </NotificationColumns>
    </section>
  )
}
