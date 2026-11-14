import { env } from "../env"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, type Prisma } from "../../prisma/generated/client"

export function openDatabase(url = env.DATABASE_URL) {
  if (!/^postgres(?:ql)?:\/\//.test(url))
    throw new Error("DATABASE_URL musi wskazywać PostgreSQL.")
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: url,
      max: 1,
      idleTimeoutMillis: 1,
      connectionTimeoutMillis: 5000,
    }),
  })
}
const globalForPrisma = globalThis as unknown as {
  notificationDatabase?: {
    client: PrismaClient
    constructor: typeof PrismaClient
  }
}
export function getDatabase() {
  const cached = globalForPrisma.notificationDatabase
  // A regenerated client has a new constructor after development hot reload.
  if (cached?.constructor === PrismaClient) return cached.client
  const client = openDatabase()
  globalForPrisma.notificationDatabase = { client, constructor: PrismaClient }
  if (cached) void cached.client.$disconnect().catch(console.error)
  return client
}
export type DbClient = Prisma.TransactionClient
export type Database = PrismaClient
