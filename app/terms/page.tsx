import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service | STJ Southern Ambulance",
  description: "Terms of service, payment terms, and cancellation/refund policy for STJ Southern Ambulance.",
};

export default function TermsPage() {
  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen">
      <section className="py-16 bg-navy-gradient text-white">
        <div className="container-main text-center">
          <h1 className="text-display-md font-bold mb-3">Terms of Service</h1>
          <p className="text-slate-300">Last updated: May 2026</p>
        </div>
      </section>

      <article className="container-main py-16 max-w-3xl">
        <div className="space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing our website at{" "}
              <a href={SITE.url} className="text-emerald-600 dark:text-emerald-400 hover:underline">stj.lk</a>{" "}
              or using any services provided by STJ Southern Ambulance, you agree to be bound by these Terms of
              Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">2. Services</h2>
            <p>
              STJ Southern Ambulance provides private ambulance services including patient transport, airport
              medical transfers, event medical cover, and first aid training. All services are subject to
              availability and dispatch capacity at the time of request.
            </p>
            <p className="mt-2">
              We reserve the right to decline a service request if circumstances prevent safe or lawful delivery
              of care (e.g., unsafe road conditions, capacity constraints).
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">3. Bookings &amp; Invoices</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Non-emergency bookings may be made via phone, WhatsApp, email, or through an invoice link sent by our team.</li>
              <li>Bookings are confirmed only upon receipt of full or agreed partial payment.</li>
              <li>All prices are quoted in Sri Lankan Rupees (LKR) inclusive of applicable charges.</li>
              <li>Invoice amounts reflect the service scope agreed at time of booking. Additional charges may apply if service scope changes (e.g., additional distance, extended hours).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">4. Payment</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payments are processed via PayHere, a secure LKR payment gateway accepting Visa, MasterCard, and mobile wallets.</li>
              <li>By making a payment, you authorise STJ Southern Ambulance to charge the stated amount to your selected payment method.</li>
              <li>Payment confirmation will be sent to your email address on record.</li>
              <li>We do not store credit/debit card information on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">5. Cancellation &amp; Refund Policy</h2>
            <p>Given the nature of medical services, our refund policy is as follows:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Cancellations before dispatch:</strong> If you cancel a non-emergency booking before
                our ambulance has been dispatched, a full refund will be issued within 7 business days.
              </li>
              <li>
                <strong>Cancellations after dispatch:</strong> If our ambulance has been dispatched, a
                cancellation fee equivalent to the base charge (as stated on your invoice) will apply.
                Any remaining balance will be refunded within 7 business days.
              </li>
              <li>
                <strong>Emergency calls:</strong> Emergency transport charges are non-refundable once service
                has been delivered.
              </li>
              <li>
                <strong>Event cover:</strong> Cancellations made more than 48 hours before the event start
                time will receive a full refund. Cancellations within 48 hours of the event may incur a
                mobilisation fee.
              </li>
              <li>
                <strong>Training programs:</strong> Cancellations made more than 72 hours before the
                scheduled session will receive a full refund. Late cancellations may incur an administrative fee.
              </li>
              <li>
                <strong>Failed payments:</strong> If a payment fails after submission, your booking will be
                held for up to 24 hours. Our team will contact you to arrange alternative payment.
              </li>
              <li>
                <strong>Refund method:</strong> All approved refunds will be credited back to the original
                payment method used at the time of payment (i.e., the same card, bank account, or mobile
                wallet), processed via PayHere.
              </li>
            </ul>
            <p className="mt-3">
              To request a refund or cancellation, contact us at{" "}
              <a href={`mailto:${SITE.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">{SITE.email}</a>{" "}
              or call <a href={`tel:${SITE.phone}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">{SITE.phoneDisplay}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">6. Accuracy of Information</h2>
            <p>
              Customers are responsible for providing accurate information at the time of booking (patient name,
              contact number, destination, and any relevant medical conditions). STJ Southern Ambulance is not
              liable for service delays or failures resulting from inaccurate information provided by the customer.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">7. Limitation of Liability</h2>
            <p>
              STJ Southern Ambulance shall not be liable for any indirect, incidental, or consequential damages
              arising from the use of our services. Our total liability for any claim shall not exceed the amount
              paid for the specific service in dispute.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">8. Intellectual Property</h2>
            <p>
              All content on this website — including text, images, logos, and design — is the property of
              STJ Southern Ambulance and may not be reproduced without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">9. Governing Law</h2>
            <p>
              These Terms of Service are governed by the laws of the Democratic Socialist Republic of Sri Lanka.
              Any disputes shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">10. Contact</h2>
            <p>
              <strong>STJ Southern Ambulance</strong><br />
              {SITE.address}<br />
              Phone:{" "}
              <a href={`tel:${SITE.phone}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">{SITE.phoneDisplay}</a><br />
              Email:{" "}
              <a href={`mailto:${SITE.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">{SITE.email}</a>
            </p>
          </section>

        </div>
      </article>
    </div>
  );
}
