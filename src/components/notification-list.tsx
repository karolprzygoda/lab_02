import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion"
import { changeNotification } from "@/server/actions"
import { notifications } from "@/server/api/context"
import type { Notification } from "@/server/repositories/notification.repository"
import { ActionForm } from "./action-form"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "./ui/empty"
import { Separator } from "./ui/separator"
import { Bell, Mail, Smartphone } from "lucide-react"

function date(timestamp: number, timezone: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(timestamp)
}
const NOTIFICATION_STATUS_LABELS = {
  pending: "W kolejce",
  sent: "Doręczono",
  failed: "Błąd wysyłki",
  cancelled: "Anulowano",
} as const

export async function NotificationList({ items }: { items: Notification[] }) {
  if (!items.length)
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Bell />
          </EmptyMedia>
          <EmptyTitle>Brak powiadomień</EmptyTitle>
          <EmptyDescription>
            Zaplanuj wiadomość lub zmień filtry, aby zobaczyć inne
            powiadomienia.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  const histories = await Promise.all(
    items.map((item) => notifications().repository.history(item.id))
  )
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="outline">
                {item.channel === "email" ? <Mail /> : <Smartphone />}
                {item.channel === "email" ? "E-mail" : "Push"}
              </Badge>
              {item.priority === "high" ? (
                <Badge variant="secondary">Wysoki priorytet</Badge>
              ) : null}
              <Badge
                variant={
                  item.status === "failed"
                    ? "destructive"
                    : item.status === "sent"
                      ? "default"
                      : "secondary"
                }
              >
                {NOTIFICATION_STATUS_LABELS[item.status]}
              </Badge>
            </div>
            <CardTitle className="break-all">{item.recipient}</CardTitle>
            <CardDescription className="break-words whitespace-pre-wrap">
              {item.content}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">
                  {item.sent_at ? "Doręczono" : "Termin realizacji"}
                </dt>
                <dd className="mt-1">
                  {date(item.sent_at ?? item.available_at, item.timezone)}
                </dd>
                <dd className="mt-1 text-xs break-all text-muted-foreground">
                  {item.timezone}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Próby doręczenia</dt>
                <dd className="mt-1">{item.attempts} / 3</dd>
                <dd className="mt-1 text-xs text-muted-foreground">
                  {item.forced ? "Wysyłka wymuszona" : "Z ochroną ciszy nocnej"}
                </dd>
              </div>
            </dl>
            {item.available_at !== item.scheduled_at ? (
              <p className="text-xs text-muted-foreground">
                Pierwotny termin: {date(item.scheduled_at, item.timezone)}
              </p>
            ) : null}
            <Separator />
            <Accordion>
              <AccordionItem value="history">
                <AccordionTrigger>Historia i identyfikator</AccordionTrigger>
                <AccordionContent>
                  <p className="my-3 font-mono text-xs break-all text-muted-foreground">
                    {item.id}
                  </p>
                  {histories[index].length ? (
                    <ol className="flex flex-col gap-2">
                      {histories[index].map((entry) => (
                        <li key={entry.number}>
                          {entry.number}.{" "}
                          {date(entry.happened_at, item.timezone)} ·{" "}
                          {entry.outcome}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground">
                      Nie podjęto jeszcze próby doręczenia.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          {item.status === "pending" ? (
            <CardFooter>
              <ActionForm action={changeNotification} className="w-full">
                <input type="hidden" name="id" value={item.id} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    name="action"
                    value="send-now"
                    size="sm"
                  >
                    Wyślij teraz
                  </Button>
                  <Button
                    type="submit"
                    name="action"
                    value="cancel"
                    size="sm"
                    variant="outline"
                  >
                    Anuluj wysyłkę
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  „Wyślij teraz” pomija termin i ciszę nocną odbiorcy.
                </p>
              </ActionForm>
            </CardFooter>
          ) : null}
        </Card>
      ))}
    </div>
  )
}
