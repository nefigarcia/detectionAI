import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Prisma v7 moves datasource URLs out of schema.prisma and into a config file.
// We use process.env here so `npx prisma generate` won't fail in CI when the
// DATABASE_URL is intentionally not set (use `env('DATABASE_URL')` if you want
// the CLI to enforce the variable exists).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
    // shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL ?? undefined,
  },
})
