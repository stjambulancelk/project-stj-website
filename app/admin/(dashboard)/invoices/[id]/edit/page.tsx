import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { isEditable } from "@/lib/billing";
import { LOCATION_TYPE_LABEL } from "@/lib/registry";
import InvoiceForm, { type InvoiceFormInitial } from "@/components/admin/InvoiceForm";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAdminSession();
  if (session?.role === "VIEWER") redirect(`/admin/invoices/${id}`);

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, patient: true, charges: true, payments: true, pickupLocation: true, dropLocation: true },
  });
  if (!invoice) notFound();

  if (!isEditable(invoice.status, invoice.payments)) {
    return (
      <div className="p-4 sm:p-6 max-w-lg">
        <div className="rounded-2xl bg-navy-900 border border-amber-800 p-6 space-y-3">
          <h1 className="text-white font-bold">Invoice can’t be edited</h1>
          <p className="text-slate-400 text-sm">
            <span className="font-mono">{invoice.id}</span> is <strong>{invoice.status}</strong> or has payments recorded.
            To change it, refund the payment(s) or cancel it and issue a new invoice.
          </p>
          <Link href={`/admin/invoices/${id}`} className="text-emerald-400 text-sm hover:underline">← Back to invoice</Link>
        </div>
      </div>
    );
  }

  const loc = (
    locationId: string | null,
    registry: { type: keyof typeof LOCATION_TYPE_LABEL; name: string } | null,
    snap: { type: keyof typeof LOCATION_TYPE_LABEL | null; name: string | null; address: string | null; mapsUrl: string | null }
  ) => ({
    locationId,
    linkedLabel: registry ? `${LOCATION_TYPE_LABEL[registry.type]} · ${registry.name}` : null,
    type: snap.type ?? registry?.type ?? "HOSPITAL",
    name: snap.name ?? "",
    address: snap.address ?? "",
    mapsUrl: snap.mapsUrl ?? "",
  });

  const initial: InvoiceFormInitial = {
    customerId: invoice.customerId,
    customerLabel: `${invoice.customer.name} · ${invoice.customer.phone}`,
    customer: {
      name: invoice.customer.name,
      phone: invoice.customer.phone,
      email: invoice.customer.email ?? "",
      address: invoice.billingAddress ?? invoice.customer.address ?? "",
    },
    patientId: invoice.patientId,
    patientLabel: invoice.patient ? (invoice.patient.nic ? `${invoice.patient.name} · ${invoice.patient.nic}` : invoice.patient.name) : null,
    patient: {
      name: invoice.patientName ?? "",
      nic: invoice.patientNic ?? "",
      ward: invoice.ward ?? "",
      bedNumber: invoice.bedNumber ?? "",
    },
    pickup: loc(invoice.pickupLocationId, invoice.pickupLocation, {
      type: invoice.pickupType, name: invoice.pickupName, address: invoice.pickupAddress, mapsUrl: invoice.pickupMapsUrl,
    }),
    drop: loc(invoice.dropLocationId, invoice.dropLocation, {
      type: invoice.dropType, name: invoice.dropName, address: invoice.dropAddress, mapsUrl: invoice.dropMapsUrl,
    }),
    service: {
      description: invoice.description,
      serviceDate: invoice.serviceDate ? invoice.serviceDate.toISOString().slice(0, 10) : "",
      vehicle: invoice.vehicle ?? "",
      crewNotes: invoice.crewNotes ?? "",
    },
    charges: invoice.charges.map((c) => ({
      description: c.description,
      amount: Number(c.amount).toString(),
      quantity: String(c.quantity),
    })),
  };

  return <InvoiceForm mode="edit" invoiceId={invoice.id} initial={initial} />;
}
