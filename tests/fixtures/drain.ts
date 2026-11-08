import { openDatabase } from "../../src/server/db"
import { NotificationService } from "../../src/server/services/notification.service"
const db = openDatabase()
const service = new NotificationService(db)
while (await service.tick("email", Number(process.argv[2]))) {
  /* drain */
}
await db.$disconnect()
