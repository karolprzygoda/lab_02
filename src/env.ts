import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const postgresUrl = z
  .url()
  .refine(
    (value) => /^postgres(?:ql)?:\/\//i.test(value),
    "Wymagany jest adres połączenia PostgreSQL"
  )

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: postgresUrl,
    SHADOW_DATABASE_URL: postgresUrl.optional(),
    TEST_DATABASE_URL: postgresUrl.optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
  },
  emptyStringAsUndefined: true,
})
