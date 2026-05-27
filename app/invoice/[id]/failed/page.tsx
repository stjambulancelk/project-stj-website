import Link from "next/link";
import { HiXCircle, HiPhone, HiMail } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Failed | STJ Southern Ambulance",
  robots: { index: false, follow: false },
};

export default async function PaymentFailedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen flex items-center justify-center py-16">
      <div className="container-main max-w-md text-center">

        <div className="glass-card rounded-3xl p-10">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
            <HiXCircle className="text-4xl text-red-500" />
          </div>

          <h1 className="text-headline-md text-navy-950 dark:text-white mb-2">Payment Unsuccessful</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Invoice {id}</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            Your payment was not completed. No charge has been made to your account.
            You can try again, or contact us to arrange an alternative payment method.
          </p>

          <div className="space-y-3 mb-8">
            <Link href={`/invoice/${id}/checkout`} className="btn-emergency w-full justify-center">
              Try Again
            </Link>
            <Link href={`/invoice/${id}`} className="btn-ghost w-full justify-center">
              Back to Invoice
            </Link>
          </div>

          <div className="border-t border-slate-200 dark:border-navy-700 pt-6 space-y-2">
            <p className="text-xs text-slate-400">Need help with payment?</p>
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
