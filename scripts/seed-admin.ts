/**
 * Creates the first admin user in the database.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Or with custom values:
 *   SEED_EMAIL=admin@stj.lk SEED_PASSWORD=MyPass123 npx tsx scripts/seed-admin.ts
 */

import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import * as readline from "readline/promises";

const prisma = new PrismaClient();

function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

async function main() {
  console.log("\n=== STJ Southern Ambulance — Admin Seed ===\n");

  const existingCount = await prisma.adminUser.count();
  if (existingCount > 0) {
    console.log(`ℹ  ${existingCount} admin user(s) already exist in the database.`);
    const proceed = await prompt("Create another anyway? (y/N): ");
    if (proceed.toLowerCase() !== "y") {
      console.log("Aborted.");
      await prisma.$disconnect();
      return;
    }
  }

  const email = process.env.SEED_EMAIL ?? await prompt("Admin email [admin@stj.lk]: ") || "admin@stj.lk";
  const name  = process.env.SEED_NAME  ?? await prompt("Display name [Admin]: ") || "Admin";

  let password = process.env.SEED_PASSWORD ?? "";
  while (password.length < 8) {
    password = await prompt("Password (min 8 chars): ");
    if (password.length < 8) console.log("Too short — minimum 8 characters.");
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.error(`\n✗ User with email "${email}" already exists.`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const user = await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash: hashPassword(password),
      role: "SUPER_ADMIN",
      isActive: true,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log("\n✓ Admin user created:");
  console.log(`  ID:    ${user.id}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Name:  ${user.name}`);
  console.log(`  Role:  ${user.role}`);
  console.log("\nSign in at: http://localhost:3000/admin/login\n");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Error:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});
