import { PrismaClient } from "@prisma/client";

// Prisma singleton — prevents multiple instances during Next.js hot reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

/**
 * Options for interactive transactions. Prisma's default 5s timeout is too tight for
 * multi-step writes (registry resolve + invoice + charges) over a slow DB link.
 */
export const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 } as const;
