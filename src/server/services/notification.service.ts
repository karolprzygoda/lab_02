import type { Database } from "../db"
import {
  NotificationRepository,
  notificationView,
} from "../repositories/notification.repository"
import {
  DomainError,
  notificationSchema,
} from "../validation/notification.schema"
import { localToInstant, nextAllowedTime } from "./scheduling.service"

export class NotificationService {
  readonly repository: NotificationRepository
  constructor(private db: Database) {
    this.repository = new NotificationRepository(db)
  }

  async create(input: unknown, now = Date.now()) {
    const result = notificationSchema.safeParse(input)
    if (!result.success)
      throw new DomainError(
        result.error.issues.map((issue) => issue.message).join(" ")
      )
    const data = result.data
    const existing = await this.repository.get(data.id)
    if (existing) return existing
    const scheduled = localToInstant(data.scheduledLocal, data.timezone)
    if (scheduled <= now)
      throw new DomainError("Termin musi przypadać w przyszłości.")
    return notificationView(
      await this.db.notification.upsert({
        where: { id: data.id },
        update: {},
        create: {
          id: data.id,
          content: data.content,
          recipient: data.recipient,
          channel: data.channel,
          timezone: data.timezone,
          priority: data.priority,
          scheduled_at: new Date(scheduled),
          available_at: new Date(nextAllowedTime(scheduled, data.timezone)),
          created_at: new Date(now),
          simulate_failures: data.simulateFailures,
        },
      })
    )
  }

  async change(id: string, action: "cancel" | "send-now", now = Date.now()) {
    const result = await this.db.notification.updateMany({
      where: { id, status: "pending" },
      data:
        action === "cancel"
          ? { status: "cancelled" }
          : { available_at: new Date(now), forced: true },
    })
    if (!result.count)
      throw new DomainError(
        "Powiadomienie zostało już obsłużone lub nie istnieje."
      )
  }

  async tick(channel: "email" | "push", now = Date.now()) {
    await this.db.worker.upsert({
      where: { channel },
      create: { channel, heartbeat: new Date(now) },
      update: { heartbeat: new Date(now) },
    })
    return this.db.$transaction(async (tx) => {
      // A row lock protects delivery and cancellation. Other workers skip this job.
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM notifications
        WHERE channel = ${channel}::"Channel" AND status = 'pending' AND available_at <= ${new Date(now)}
        ORDER BY priority, available_at, created_at, id
        LIMIT 1 FOR UPDATE SKIP LOCKED`
      if (!rows[0]) return null
      const notification = await tx.notification.findUniqueOrThrow({
        where: { id: rows[0].id },
      })
      const allowed = notification.forced
        ? now
        : nextAllowedTime(now, notification.timezone)
      if (allowed > now) {
        await tx.notification.update({
          where: { id: notification.id },
          data: { available_at: new Date(allowed) },
        })
        return { id: notification.id, outcome: "deferred" }
      }
      const attempt = notification.attempts + 1
      const failed = attempt <= notification.simulate_failures
      const outcome = failed ? "Symulowana awaria kanału" : "Doręczono"
      await tx.attempt.create({
        data: {
          notification_id: notification.id,
          number: attempt,
          happened_at: new Date(now),
          outcome,
        },
      })
      if (failed) {
        const retryAt = now + 10_000 * 2 ** (attempt - 1)
        await tx.notification.update({
          where: { id: notification.id },
          data: {
            attempts: attempt,
            status: attempt === 3 ? "failed" : "pending",
            available_at: new Date(
              notification.forced
                ? retryAt
                : nextAllowedTime(retryAt, notification.timezone)
            ),
          },
        })
      } else {
        await tx.delivery.create({
          data: {
            notification_id: notification.id,
            recipient: notification.recipient,
            channel,
            content: notification.content,
            delivered_at: new Date(now),
          },
        })
        await tx.notification.update({
          where: { id: notification.id },
          data: { status: "sent", attempts: attempt, sent_at: new Date(now) },
        })
      }
      return { id: notification.id, outcome }
    })
  }
}
