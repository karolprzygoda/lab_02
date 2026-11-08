import "dotenv/config"
import { env } from "../src/env"
import { test, before, beforeEach, after } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { spawn, execFileSync } from "node:child_process"
import { openDatabase } from "../src/server/db"
import { NotificationService } from "../src/server/services/notification.service"
import {
  localToInstant,
  nextAllowedTime,
} from "../src/server/services/scheduling.service"

const testUrl = env.TEST_DATABASE_URL
if (!testUrl) throw new Error("Ustaw TEST_DATABASE_URL w .env.")
const target = new URL(testUrl)
const production = new URL(env.DATABASE_URL)
if (target.host === production.host && target.pathname === production.pathname)
  throw new Error("Baza testowa musi być oddzielna.")
if (
  !["localhost", "127.0.0.1"].includes(target.hostname) ||
  target.port !== "51514"
)
  throw new Error(
    "Testy czyszczą wyłącznie lokalną bazę testową na porcie 51514."
  )
const db = openDatabase(testUrl)
const service = new NotificationService(db)
const now = Date.parse("2027-01-05T10:00Z"),
  due = now + 60_000
const input = (overrides = {}) => ({
  id: randomUUID(),
  content: "Przypomnienie",
  recipient: "test@example.com",
  channel: "email",
  timezone: "UTC",
  priority: "low",
  scheduledLocal: "2027-01-05T10:01",
  simulateFailures: 0,
  ...overrides,
})
before(() => {
  execFileSync("pnpm", ["db:deploy"], {
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "pipe",
  })
})
beforeEach(async () => {
  await db.attempt.deleteMany()
  await db.delivery.deleteMany()
  await db.notification.deleteMany()
  await db.worker.deleteMany()
})
after(async () => {
  await db.$disconnect()
})

test("trwałość po ponownym połączeniu i idempotencja równoczesnych zgłoszeń", async () => {
  const data = input()
  await Promise.all([service.create(data, now), service.create(data, now)])
  const other = openDatabase(testUrl),
    restarted = new NotificationService(other)
  try {
    assert.equal((await restarted.repository.list()).length, 1)
    assert.equal(await restarted.tick("email", now), null)
    await restarted.tick("email", due)
    await restarted.tick("email", due)
    assert.equal((await restarted.repository.get(data.id))?.status, "sent")
    assert.equal(await db.delivery.count(), 1)
  } finally {
    await other.$disconnect()
  }
})

test("priorytet, FIFO i osobne kanały", async () => {
  const low = await service.create(input(), now)
  const high = await service.create(input({ priority: "high" }), now + 1)
  const push = await service.create(input({ channel: "push" }), now)
  assert.equal((await service.tick("email", due))?.id, high.id)
  assert.equal((await service.repository.get(push.id))?.status, "pending")
  assert.equal((await service.tick("email", due))?.id, low.id)
  assert.equal((await service.tick("push", due))?.id, push.id)
  const first = await service.create(input(), now),
    second = await service.create(input(), now + 1)
  assert.equal((await service.tick("email", due))?.id, first.id)
  assert.equal((await service.tick("email", due))?.id, second.id)
})

test("maksymalnie trzy próby, backoff i sukces lub błąd", async () => {
  for (const failures of [2, 3]) {
    const item = await service.create(
      input({ simulateFailures: failures }),
      now
    )
    await service.tick("email", due)
    assert.equal(await service.tick("email", due + 9999), null)
    await service.tick("email", due + 10000)
    await service.tick("email", due + 30000)
    assert.equal(await service.tick("email", due + 60000), null)
    const row = await service.repository.get(item.id)
    assert.equal(row?.attempts, 3)
    assert.equal(row?.status, failures === 2 ? "sent" : "failed")
    assert.equal((await service.repository.history(item.id)).length, 3)
  }
  assert.equal(await db.delivery.count(), 1)
})

test("anulowanie i natychmiastowa wysyłka w nocy", async () => {
  const item = await service.create(input(), now)
  await service.change(item.id, "cancel")
  assert.equal(await service.tick("email", due), null)
  await assert.rejects(() => service.change(item.id, "send-now"))
  const forced = await service.create(
    input({ scheduledLocal: "2027-01-06T23:00" }),
    now
  )
  const night = Date.parse("2027-01-05T23:00Z")
  await service.change(forced.id, "send-now", night)
  assert.equal((await service.tick("email", night))?.id, forced.id)
  await assert.rejects(() => service.change(forced.id, "cancel"))
})

test("cisza nocna, strefy i DST", () => {
  assert.equal(localToInstant("2027-01-05T11:00", "Europe/Warsaw"), now)
  assert.equal(
    nextAllowedTime(Date.parse("2027-01-05T21:00Z"), "Europe/Warsaw"),
    Date.parse("2027-01-06T07:00Z")
  )
  assert.equal(
    nextAllowedTime(Date.parse("2027-01-05T07:00Z"), "Europe/Warsaw"),
    Date.parse("2027-01-05T07:00Z")
  )
  assert.throws(() => localToInstant("2027-03-28T02:30", "Europe/Warsaw"))
  assert.throws(() => localToInstant("2027-10-31T02:30", "Europe/Warsaw"))
})

test("cisza nocna po przestoju oraz przy retry", async () => {
  const item = await service.create(input(), now)
  assert.equal(
    (await service.tick("email", Date.parse("2027-01-05T23:00Z")))?.outcome,
    "deferred"
  )
  assert.equal((await service.repository.get(item.id))?.attempts, 0)
  const retry = await service.create(
    input({ scheduledLocal: "2027-01-05T21:59", simulateFailures: 1 }),
    now
  )
  await service.tick("email", Date.parse("2027-01-05T21:59:55Z"))
  assert.equal(
    (await service.repository.get(retry.id))?.available_at,
    Date.parse("2027-01-06T08:00Z")
  )
})

test("walidacja", async () => {
  for (const overrides of [
    { content: " " },
    { recipient: "bad" },
    { timezone: "Invalid/Zone" },
    { priority: "urgent" },
    { channel: "sms" },
    { simulateFailures: 4 },
    { scheduledLocal: "2020-01-01T10:00" },
  ])
    await assert.rejects(() => service.create(input(overrides), now))
})

test("błąd zapisu doręczenia wycofuje całą transakcję", async () => {
  const item = await service.create(input(), now)
  await db.$executeRawUnsafe(
    `CREATE FUNCTION test_fail_delivery() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test failure'; END $$`
  )
  await db.$executeRawUnsafe(
    `CREATE TRIGGER test_fail BEFORE INSERT ON deliveries FOR EACH ROW EXECUTE FUNCTION test_fail_delivery()`
  )
  try {
    await assert.rejects(() => service.tick("email", due))
    assert.equal((await service.repository.get(item.id))?.attempts, 0)
    assert.equal(await db.attempt.count(), 0)
    assert.equal(await db.delivery.count(), 0)
  } finally {
    await db.$executeRawUnsafe("DROP TRIGGER test_fail ON deliveries")
    await db.$executeRawUnsafe("DROP FUNCTION test_fail_delivery()")
  }
  await service.tick("email", due)
  assert.equal(await db.delivery.count(), 1)
})

test("konkurujące procesy nie duplikują ani nie pomijają zadań", async () => {
  for (let i = 0; i < 30; i++) await service.create(input(), now)
  const run = () =>
    new Promise<void>((resolve, reject) => {
      const child = spawn(
        process.execPath,
        ["--import", "tsx", "tests/fixtures/drain.ts", String(due)],
        { env: { ...process.env, DATABASE_URL: testUrl }, stdio: "pipe" }
      )
      let errors = ""
      child.stderr.on("data", (data) => {
        errors += data
      })
      child.on("error", reject)
      child.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error(errors))
      )
    })
  const outcomes = await Promise.allSettled([run(), run()])
  for (const outcome of outcomes)
    if (outcome.status === "rejected") throw outcome.reason
  assert.equal(await db.delivery.count(), 30)
  assert.equal(await db.attempt.count(), 30)
  assert.equal(await db.notification.count({ where: { status: "sent" } }), 30)
})

test("wyścig anulowania z doręczeniem kończy się spójnym statusem", async () => {
  const item = await service.create(input(), now)
  await Promise.allSettled([
    service.tick("email", due),
    service.change(item.id, "cancel"),
  ])
  const row = await service.repository.get(item.id)
  const delivered = await db.delivery.count({
    where: { notification_id: item.id },
  })
  assert.equal(delivered, row?.status === "sent" ? 1 : 0)
  assert.ok(row?.status === "sent" || row?.status === "cancelled")
})
