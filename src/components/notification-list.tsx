import Link from "next/link"
import { Button } from "./ui/button"
import type { NotificationFiltersQuery } from "./notification-filters"
import { NotificationTime } from "./notification-time"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table"
import type { Notification } from "@/server/repositories/notification.repository"
import { Badge } from "./ui/badge"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "./ui/empty"
import { Bell, Mail, Smartphone } from "lucide-react"

const CELL_TEXT_LIMIT = 30

function TruncatedCellText({ value }: { value?: string | null }) {
  const text = value ?? "—"
  const characters = Array.from(text)
  if (characters.length <= CELL_TEXT_LIMIT) {
    return <span className="inline-block whitespace-nowrap">{text}</span>
  }
  return (
    <>
      <span className="whitespace-nowrap xl:hidden">{text}</span>
      <span className="hidden xl:inline">
        <Tooltip>
          <TooltipTrigger className="cursor-help rounded-sm whitespace-nowrap">
            {characters.slice(0, CELL_TEXT_LIMIT).join("")}...
          </TooltipTrigger>
          <TooltipContent className="break-all whitespace-normal">
            {text}
          </TooltipContent>
        </Tooltip>
      </span>
    </>
  )
}

const NOTIFICATION_STATUS_LABELS = {
  pending: "W kolejce",
  sent: "Doręczono",
  failed: "Błąd wysyłki",
  cancelled: "Anulowano",
} as const

export function NotificationList({
  items,
  query,
}: {
  items: Notification[]
  query: NotificationFiltersQuery
}) {
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
  return (
    <TooltipProvider>
      <div className="min-w-0 rounded-xl border">
        <Table className="[&_td]:text-center [&_td:not(:last-child)]:border-r [&_th]:text-center [&_th:not(:last-child)]:border-r">
          <TableHeader>
            <TableRow>
              {[
                ["title", "Tytuł"],
                ["recipient", "Odbiorca"],
                ["channel", "Typ kanału"],
                ["priority", "Priorytet"],
                ["status", "Status"],
                ["created", "Termin utworzenia"],
                ["scheduled", "Planowany termin realizacji"],
                ["attempts", "Próby doręczenia"],
                ["details", "Szczegóły"],
              ].map(([key, label]) => (
                <TableHead key={key} data-column={key}>
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell data-column="title">
                  <TruncatedCellText value={item.title} />
                </TableCell>
                <TableCell data-column="recipient">
                  <TruncatedCellText value={item.recipient} />
                </TableCell>
                <TableCell data-column="channel">
                  <Badge
                    variant="outline"
                    data-channel={item.channel}
                    className="notification-channel"
                  >
                    {item.channel === "email" ? <Mail /> : <Smartphone />}
                    {item.channel === "email" ? "E-mail" : "Push"}
                  </Badge>
                </TableCell>
                <TableCell data-column="priority">
                  <Badge
                    variant="outline"
                    className="notification-priority"
                    data-priority={item.priority}
                  >
                    {item.priority === "high" ? "Wysoki" : "Niski"}
                  </Badge>
                </TableCell>
                <TableCell data-column="status">
                  <Badge
                    variant="outline"
                    data-status={item.status}
                    className="notification-status"
                  >
                    {NOTIFICATION_STATUS_LABELS[item.status]}
                  </Badge>
                </TableCell>
                <TableCell data-column="created">
                  <NotificationTime
                    timestamp={item.created_at}
                    timezone={item.created_timezone ?? "UTC"}
                    timezoneLabel={
                      item.created_timezone
                        ? "Strefa czasowa autora"
                        : "Strefa autora nieznana — wyświetlono w UTC"
                    }
                  />
                </TableCell>
                <TableCell data-column="scheduled">
                  <NotificationTime
                    timestamp={item.available_at}
                    timezone={item.timezone}
                  />
                </TableCell>
                <TableCell data-column="attempts">
                  {item.attempts} / 3
                </TableCell>
                <TableCell data-column="details">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link
                        href={{
                          pathname: "/",
                          query: {
                            status: query.status,
                            channel: query.channel,
                            notification: item.id,
                          },
                        }}
                        scroll={false}
                        prefetch={false}
                      />
                    }
                    aria-label={`Szczegóły powiadomienia do ${item.recipient}`}
                  >
                    Szczegóły
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
