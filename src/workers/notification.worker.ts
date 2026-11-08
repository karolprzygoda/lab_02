import { setTimeout } from "node:timers/promises"
import { getDatabase } from "../server/db"
import { NotificationService } from "../server/services/notification.service"

const channel = process.argv[2]
if (channel !== "email" && channel !== "push")
  throw new Error("Podaj kanał: email lub push.")
const db = getDatabase()
const service = new NotificationService(db)
let running = true
process.on("SIGINT", () => {
  running = false
})
process.on("SIGTERM", () => {
  running = false
})
console.log(`Worker ${channel} uruchomiony`)
while (running) {
  try {
    const result = await service.tick(channel)
    if (result) console.log(JSON.stringify({ channel, ...result }))
    else await setTimeout(1000)
  } catch (error) {
    console.error(error)
    await setTimeout(1000)
  }
}
await db.$disconnect()
