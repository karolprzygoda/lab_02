import "server-only"
import { getDatabase } from "../db"
import { NotificationService } from "../services/notification.service"

export function notifications() {
  return new NotificationService(getDatabase())
}
