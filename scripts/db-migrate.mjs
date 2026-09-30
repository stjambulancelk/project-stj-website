/**
 * Safe DB migration runner — used by Railway start command.
 *
 * Replaces `prisma db push --accept-data-loss` (which could silently drop
 * columns/tables) with versioned migrations:
 *
 *   1. If the DB already has the app tables but no migration history
 *      (i.e. it was managed by `db push` before), mark `0_init` as applied
 *      so Prisma does not try to re-create existing tables.
 *   2. Run `prisma migrate deploy` — applies only pending migrations,
 *      never drops data, fails loudly instead of guessing.
 *
 * Usage: node scripts/db-migrate.mjs
 */

import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const BASELINE = "0_init";

function run(cmd) {
  console.log(`[db-migrate] $ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

async function needsBaseline() {
  const prisma = new PrismaClient();
  try {
    const [{ app_tables }] = await prisma.$queryRawUnsafe(
      `SELECT count(*)::int AS app_tables FROM information_schema.tables
       WHERE table_schema = current_schema() AND table_name = 'Invoice'`
    );
    if (app_tables === 0) return false; // fresh DB — let 0_init create everything

    const [{ has_history }] = await prisma.$queryRawUnsafe(
      `SELECT count(*)::int AS has_history FROM information_schema.tables
       WHERE table_schema = current_schema() AND table_name = '_prisma_migrations'`
    );
    if (has_history === 0) return true;

    const rows = await prisma.$queryRawUnsafe(
      `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL`,
      BASELINE
    );
    return rows.length === 0;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (await needsBaseline()) {
    console.log(`[db-migrate] Existing schema without migration history — baselining ${BASELINE}`);
    run(`npx prisma migrate resolve --applied ${BASELINE}`);
  }
  run("npx prisma migrate deploy");
}

main().catch((err) => {
  console.error("[db-migrate] FAILED:", err);
  process.exit(1);
});
