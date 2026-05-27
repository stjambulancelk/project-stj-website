import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | STJ Southern Ambulance",
  description: "Terms and Conditions for using STJ Southern Ambulance services.",
};

export default function TermsPage() {
  return (
    <div className="mt-20 lg:mt-24">
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last Updated: February 12, 2026</p>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4">1. About Our Services</h2>
            <p className="mb-6">
              STJ Southern Ambulance provides professional ambulance services including emergency response, patient
              transport, airport transfers, event medical cover, and first aid training across Southern Province, Sri Lanka.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Emergency Services Disclaimer</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
              <p className="font-semibold mb-2">⚠️ Important:</p>
              <p>
                Our services complement but do not replace government emergency services. <strong>In life-threatening
                emergencies, always call 1990 (Sri Lanka emergency number) first</strong>.
              </p>
            </div>
            <p className="mb-6">
              While we strive for rapid response, response times may vary based on location, traffic conditions, ambulance
              availability, and weather. We do not guarantee specific response times and are not liable for delays beyond
              our control.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Service Booking and Cancellation</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">Booking</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Emergency services: Call immediately at 077 282 6946</li>
              <li>Scheduled transfers: Book 24 hours in advance when possible</li>
              <li>Event cover: Book 2-4 weeks in advance</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Cancellation Policy</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Cancel at least 12 hours in advance for full refund</li>
              <li>Less than 12 hours: Cancellation fee may apply</li>
              <li>No-show: Full charge applies</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Fees and Payment</h2>
            <p className="mb-4">
              Fees vary based on service type, distance, and requirements. Quotes are provided upon request. Payment is
              due at time of service or as agreed. We can provide documentation for insurance claims.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Patient Information and Consent</h2>
            <p className="mb-4">By using our services, you (or your authorized representative) consent to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Collection of necessary medical information</li>
              <li>Provision of appropriate pre-hospital care</li>
              <li>Communication with healthcare facilities</li>
              <li>Documentation of services provided</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">To the maximum extent permitted by law:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>We provide services in accordance with accepted pre-hospital medical practices</li>
              <li>We are not liable for outcomes beyond our direct control</li>
              <li>We are not responsible for diagnosis or treatment decisions made by hospitals</li>
              <li>Complications may occur despite proper care</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Dispute Resolution</h2>
            <p className="mb-4">
              These Terms are governed by the laws of Sri Lanka. Any disputes shall be subject to the exclusive jurisdiction
              of the courts of Galle, Sri Lanka. We encourage contacting us first to resolve disputes informally.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Contact Information</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p><strong>STJ Southern Ambulance</strong><br />
              No2f, Prof M.D. Rathnasooriya Mawatha<br />
              Galle 80000, Sri Lanka</p>
              <p className="mt-4">
                <strong>Email:</strong> <a href="mailto:ambulance.stj@gmail.com" className="text-primary hover:text-primary-light">ambulance.stj@gmail.com</a><br />
                <strong>Phone:</strong> <a href="tel:+94772826946" className="text-primary hover:text-primary-light">077 282 6946</a><br />
                <strong>Hours:</strong> 24/7
              </p>
            </div>

            <p className="text-sm text-gray-600 mt-8">
              <strong>Note:</strong> We reserve the right to modify these Terms at any time. Changes will be effective
              upon posting with an updated date. Your continued use of our services constitutes acceptance of updated Terms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
