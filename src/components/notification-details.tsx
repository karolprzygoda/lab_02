import { ScrollArea } from "./ui/scroll-area"
import { NotificationDetailsContent } from "./notification-detail-dialog"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { NotificationActions } from "./notification-actions"
import type {
  Notification,
  NotificationRepository,
} from "@/server/repositories/notification.repository"
import { Mail, Smartphone } from "lucide-react"

const NOTIFICATION_STATUS_LABELS = {
  pending: "W kolejce",
  sent: "Doręczono",
  failed: "Błąd wysyłki",
  cancelled: "Anulowano",
} as const
function date(timestamp: number, timezone: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(timestamp)
}
export function NotificationDetails({
  item,
  history,
}: {
  item: Notification
  history: Awaited<ReturnType<NotificationRepository["history"]>>
}) {
  return (
    <NotificationDetailsContent
      title={item.title}
      badges={
        <>
          <Badge
            variant="outline"
            data-channel={item.channel}
            className="notification-channel"
          >
            {item.channel === "email" ? <Mail /> : <Smartphone />}
            {item.channel === "email" ? "E-mail" : "Push"}
          </Badge>
          <Badge
            variant="outline"
            data-priority={item.priority}
            className="notification-priority"
          >
            {item.priority === "high" ? "Wysoki priorytet" : "Niski priorytet"}
          </Badge>
          <Badge
            variant="outline"
            data-status={item.status}
            className="notification-status"
          >
            {NOTIFICATION_STATUS_LABELS[item.status]}
          </Badge>
        </>
      }
      actions={
        item.status === "pending" ? (
          <div className="shrink-0 border-t bg-muted/30 p-6">
            <NotificationActions id={item.id} />
          </div>
        ) : null
      }
    >
      <ScrollArea className="min-h-0 flex-1 **:data-[slot=scroll-area-viewport]:max-h-[calc(90dvh-19rem)]">
        <div className="flex flex-col gap-6 p-6 pr-8">
          <section className="flex flex-col gap-3" aria-label="Wiadomość">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                Odbiorca
              </h3>
              <p className="mt-1 font-medium break-all">{item.recipient}</p>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                Treść wiadomości
              </h3>
              <p className="rounded-lg bg-muted/50 p-4 leading-relaxed wrap-break-word whitespace-pre-wrap">
                {item.content}
              </p>
            </div>
          </section>
          <Separator />
          <section
            aria-label="Terminy doręczenia"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Terminy i doręczenie</h3>
              <span className="text-xs text-muted-foreground">
                {item.timezone}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              {[
                [
                  "Utworzono",
                  date(item.created_at, item.created_timezone ?? "UTC") +
                    " · " +
                    (item.created_timezone ?? "UTC (strefa autora nieznana)"),
                ],
                ["Zaplanowano", date(item.scheduled_at, item.timezone)],
                [
                  item.sent_at ? "Doręczono" : "Aktualny termin realizacji",
                  date(item.sent_at ?? item.available_at, item.timezone),
                ],
                ["Próby doręczenia", item.attempts + " / 3"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              {item.forced
                ? "Wysyłka wymuszona — z pominięciem terminu i ciszy nocnej."
                : item.ignore_quiet_hours
                  ? "Cisza nocna pominięta — doręczenie zgodnie z wybranym terminem."
                  : "Ochrona ciszy nocnej: 22:00–08:00 czasu odbiorcy."}
            </p>
          </section>
          <Separator />
          <section className="flex flex-col gap-4" aria-label="Historia prób">
            <h3 className="font-semibold">
              Historia prób{" "}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({history.length})
              </span>
            </h3>
            {history.length ? (
              <ol className="flex flex-col">
                {history.map((entry) => (
                  <li
                    key={entry.number}
                    className="relative ml-3 border-l pb-5 pl-6 last:border-transparent last:pb-0"
                  >
                    <Badge
                      variant="outline"
                      className="notification-status absolute top-0 -left-3 size-6 justify-center rounded-full bg-background p-0"
                      data-status={
                        entry.outcome === "Doręczono" ? "sent" : "failed"
                      }
                    >
                      {entry.number}
                    </Badge>
                    <p className="font-medium">{entry.outcome}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {date(entry.happened_at, item.timezone)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {item.status === "cancelled"
                  ? "Wysyłkę anulowano przed pierwszą próbą doręczenia."
                  : "Nie podjęto jeszcze próby doręczenia."}
              </p>
            )}
          </section>
          <div className="border-t pt-4">
            <h3 className="mb-1 text-xs text-muted-foreground">
              Identyfikator powiadomienia
            </h3>
            <p className="font-mono text-xs break-all select-all">{item.id}</p>
          </div>
        </div>
      </ScrollArea>
    </NotificationDetailsContent>
  )
}
