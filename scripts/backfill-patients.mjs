/**
 * Backfill the Patient registry from patient fields already typed on invoices.
 *
 *   node scripts/backfill-patients.mjs          # dry run — prints what it would do
 *   node scripts/backfill-patients.mjs --apply  # writes
 *
 * Groups invoices with no patientId by NIC (or by name when NIC is empty),
 * reuses an existing Patient with the same NIC, otherwise creates one, then links invoices.
 * Safe to re-run: only touches invoices where patientId IS NULL.
 */

import { PrismaClient } from "@prisma/client";

const apply = process.argv.includes("--apply");
const prisma = new PrismaClient();

async function main() {
  const invoices = await prisma.invoice.findMany({
    where: { patientId: null, patientName: { not: null } },
    select: { id: true, patientName: true, patientNic: true },
  });

  const groups = new Map();
  for (const inv of invoices) {
    const name = inv.patientName.trim();
    if (!name) continue;
    const nic = inv.patientNic?.trim().toUpperCase() || null;
    const key = nic ? `nic:${nic}` : `name:${name.toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, { name, nic, ids: [] });
    groups.get(key).ids.push(inv.id);
  }

  console.log(`${invoices.length} invoice(s) without a linked patient → ${groups.size} patient(s)`);
  let created = 0, reused = 0;

  for (const g of groups.values()) {
    const existing = g.nic ? await prisma.patient.findFirst({ where: { nic: g.nic } }) : null;
    console.log(`  ${existing ? "reuse " : "create"} ${g.name}${g.nic ? ` (${g.nic})` : ""} ← ${g.ids.join(", ")}`);
    if (!apply) continue;

    await prisma.$transaction(async (tx) => {
      const patient = existing ?? (await tx.patient.create({ data: { name: g.name, nic: g.nic } }));
      await tx.invoice.updateMany({ where: { id: { in: g.ids }, patientId: null }, data: { patientId: patient.id } });
    });
    existing ? reused++ : created++;
  }

  console.log(apply ? `Done: ${created} created, ${reused} reused.` : "Dry run only — re-run with --apply to write.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
