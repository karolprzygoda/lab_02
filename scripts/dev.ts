import "dotenv/config"
import { spawn, type ChildProcess } from "node:child_process"
import { createRequire } from "node:module"
import {
  startPrismaDevServer,
  ServerAlreadyRunningError,
  type Server,
} from "@prisma/dev"
import { env } from "../src/env"

const require = createRequire(import.meta.url)
const testing = process.argv.includes("--test")
const databaseOnly = testing || process.argv.includes("--database-only")
const databaseUrl = testing ? env.TEST_DATABASE_URL : env.DATABASE_URL
if (!databaseUrl) throw new Error("Ustaw TEST_DATABASE_URL w .env.")
const url = new URL(databaseUrl)
if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
  throw new Error(
    "pnpm dev uruchamia lokalną bazę. Dla zewnętrznej bazy użyj pnpm dev:web."
  )
}
const databasePort = Number(url.port)
if (
  !Number.isInteger(databasePort) ||
  databasePort < 1025 ||
  databasePort > 65534
) {
  throw new Error("W adresie lokalnej bazy ustaw port z zakresu 1025–65534.")
}

let database: Server | undefined
let child: ChildProcess | undefined
let stopping = false
let resolveStop: () => void
const stopped = new Promise<void>((resolve) => {
  resolveStop = resolve
})
function requestStop() {
  stopping = true
  if (child) child.kill("SIGTERM")
  resolveStop()
}
process.once("SIGINT", requestStop)
process.once("SIGTERM", requestStop)

async function run(entry: string, args: string[]) {
  if (stopping) return 0
  return new Promise<number>((resolve, reject) => {
    child = spawn(process.execPath, [require.resolve(entry), ...args], {
      stdio: "inherit",
      env: process.env,
    })
    child.once("error", reject)
    child.once("exit", (code) => {
      child = undefined
      resolve(stopping ? 0 : (code ?? 1))
    })
  })
}

try {
  try {
    database = await startPrismaDevServer({
      name: testing ? "lab02-prisma-test" : "lab02-prisma",
      port: databasePort - 1,
      databasePort,
      shadowDatabasePort: databasePort + 1,
      persistenceMode: "stateful",
    })
  } catch (error) {
    if (!(error instanceof ServerAlreadyRunningError)) throw error
    console.log("Korzystam z już uruchomionej lokalnej bazy Prisma.")
  }
  console.log(`Prisma Postgres gotowy na porcie ${databasePort}.`)
  if (databaseOnly) {
    if (database && !stopping) {
      await stopped
    }
  } else {
    const generated = await run("prisma/build/index.js", ["generate"])
    const migrated =
      generated === 0
        ? await run("prisma/build/index.js", ["migrate", "deploy"])
        : generated
    process.exitCode =
      migrated === 0
        ? await run("next/dist/bin/next", ["dev", ...process.argv.slice(2)])
        : migrated
  }
} finally {
  await database?.close()
}
