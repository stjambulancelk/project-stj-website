import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | STJ Southern Ambulance",
  description: "Privacy policy for STJ Southern Ambulance — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen">
      <section className="py-16 bg-navy-gradient text-white">
        <div className="container-main text-center">
          <h1 className="text-display-md font-bold mb-3">Privacy Policy</h1>
          <p className="text-slate-300">Last updated: May 2026</p>
        </div>
      </section>

      <article className="container-main py-16 max-w-3xl prose prose-slate dark:prose-invert">
        <div className="space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">1. Introduction</h2>
            <p>
              STJ Southern Ambulance (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), operating at{" "}
              {SITE.address}, is committed to protecting your privacy. This Privacy Policy explains how we
              collect, use, and safeguard information when you use our website at{" "}
              <a href="https://stj.lk" className="text-emerald-600 dark:text-emerald-400 hover:underline">stj.lk</a>{" "}
              or engage our services.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">2. Information We Collect</h2>
            <p>We may collect the following personal information voluntarily provided by you:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Full name, contact number, and email address</li>
              <li>Billing and payment information (processed securely through PayHere)</li>
              <li>Medical transport details necessary to deliver our services (e.g., destination, condition notes)</li>
              <li>IP address and browser information collected automatically for security and audit purposes</li>
              <li>Enquiry and contact form submissions</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> store full payment card details on our servers. All card transactions
              are handled by PayHere, a PCI-DSS compliant payment gateway.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and fulfil your ambulance transport booking or service request</li>
              <li>To communicate with you regarding your booking, invoice, or enquiry</li>
              <li>To process payments and issue receipts</li>
              <li>To improve our website and services</li>
              <li>To maintain security audit logs in compliance with applicable law</li>
              <li>To respond to legal requests or prevent fraud</li>
            </ul>
            <p className="mt-3">
              We will never sell or rent your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">4. Information Sharing</h2>
            <p>We may share your information only with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>PayHere</strong> — our payment gateway partner, solely for processing transactions</li>
              <li><strong>Law enforcement or regulatory authorities</strong> — when required by law</li>
              <li><strong>Our dispatch team</strong> — internally, to coordinate your transport</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">5. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to deliver services and comply with legal
              obligations. Security audit log data (stored in hashed form) is retained for a maximum of 90 days.
              You may request deletion of your data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">6. Cookies</h2>
            <p>
              Our website may use essential session cookies to enable functionality (e.g., maintaining your
              session). We do not use tracking or advertising cookies. You may disable cookies via your browser
              settings; however, this may affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">7. Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal information
              against unauthorised access, disclosure, or alteration. IP addresses collected for audit purposes
              are stored in hashed (anonymised) form and cannot be reverse-engineered.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Withdraw consent for non-essential communications</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a href={`mailto:${SITE.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">{SITE.email}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an
              updated date. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-3">10. Contact Us</h2>
            <p>
              For any privacy-related questions, contact:<br />
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
