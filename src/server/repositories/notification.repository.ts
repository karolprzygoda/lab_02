import type { DbClient } from "../db"
import type { Notification as Record } from "../../../prisma/generated/client"

export const NOTIFICATION_LIST_LIMIT = 200

const WORKER_HEARTBEAT_TIMEOUT_MS = 15_000

export function notificationView(row: Record) {
  return {
    ...row,
    scheduled_at: row.scheduled_at.getTime(),
    available_at: row.available_at.getTime(),
    created_at: row.created_at.getTime(),
    sent_at: row.sent_at?.getTime() ?? null,
  }
}
export type Notification = ReturnType<typeof notificationView>
export class NotificationRepository {
  constructor(readonly db: DbClient) {}
  async list() {
    const rows = await this.db.notification.findMany({
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: NOTIFICATION_LIST_LIMIT,
    })
    return rows.map(notificationView)
  }
  async get(id: string) {
    const row = await this.db.notification.findUnique({ where: { id } })
    return row ? notificationView(row) : null
  }
  async history(id: string) {
    const rows = await this.db.attempt.findMany({
      where: { notification_id: id },
      orderBy: { number: "asc" },
    })
    return rows.map((row) => ({
      ...row,
      happened_at: row.happened_at.getTime(),
    }))
  }
  async workers() {
    return (await this.db.worker.findMany()).map((row) => ({
      ...row,
      heartbeat: row.heartbeat.getTime(),
      active:
        Date.now() - row.heartbeat.getTime() < WORKER_HEARTBEAT_TIMEOUT_MS,
    }))
  }
  async counts() {
    return (
      await this.db.notification.groupBy({
        by: ["status"],
        _count: { _all: true },
      })
    ).map((row) => ({ status: row.status, count: row._count._all }))
  }
}
