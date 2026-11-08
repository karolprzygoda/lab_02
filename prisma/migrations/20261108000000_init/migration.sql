-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('email', 'push');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('high', 'low');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'sent', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "recipient" VARCHAR(254) NOT NULL,
    "channel" "Channel" NOT NULL,
    "timezone" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "scheduled_at" TIMESTAMPTZ(3) NOT NULL,
    "available_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "simulate_failures" INTEGER NOT NULL DEFAULT 0,
    "forced" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMPTZ(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "notification_id" UUID NOT NULL,
    "recipient" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "content" TEXT NOT NULL,
    "delivered_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" SERIAL NOT NULL,
    "notification_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "happened_at" TIMESTAMPTZ(3) NOT NULL,
    "outcome" TEXT NOT NULL,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "channel" "Channel" NOT NULL,
    "heartbeat" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("channel")
);

-- CreateIndex
CREATE INDEX "notifications_channel_status_available_at_idx" ON "notifications"("channel", "status", "available_at");

-- CreateIndex
CREATE UNIQUE INDEX "attempts_notification_id_number_key" ON "attempts"("notification_id", "number");

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "notifications" ADD CONSTRAINT "attempts_range" CHECK ("attempts" BETWEEN 0 AND 3);
ALTER TABLE "notifications" ADD CONSTRAINT "failures_range" CHECK ("simulate_failures" BETWEEN 0 AND 3);
