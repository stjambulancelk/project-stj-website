import Link from "next/link";
import { HiCheckCircle, HiPhone, HiMail } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful | STJ Southern Ambulance",
  robots: { index: false, follow: false },
};

export default async function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen flex items-center justify-center py-16">
      <div className="container-main max-w-md text-center">

        <div className="glass-card rounded-3xl p-10">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
            <HiCheckCircle className="text-4xl text-emerald-500" />
          </div>

          <h1 className="text-headline-md text-navy-950 dark:text-white mb-2">Payment Successful</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Invoice {id}</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            Thank you — your payment has been received. A confirmation email will be sent shortly.
            Our team will be in touch to confirm your booking details.
          </p>

          <div className="space-y-3 mb-8">
            <Link href={`/invoice/${id}`} className="btn-primary w-full justify-center">
              View Invoice
            </Link>
            <Link href="/" className="btn-ghost w-full justify-center">
              Back to Home
            </Link>
          </div>

          <div className="border-t border-slate-200 dark:border-navy-700 pt-6 space-y-2">
            <p className="text-xs text-slate-400">Need help? Contact us:</p>
            <div className="flex justify-center gap-4">
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                <HiPhone /> {SITE.phoneDisplay}
              </a>
              <a href={getWhatsAppUrl(SITE.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                <FaWhatsapp /> WhatsApp
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                <HiMail /> Email
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
