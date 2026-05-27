import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | STJ Southern Ambulance",
  description: "Privacy Policy for STJ Southern Ambulance - How we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mt-20 lg:mt-24">
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last Updated: February 12, 2026</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6">
              STJ Southern Ambulance ("we," "our," or "us") respects your privacy and is committed to protecting your
              personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website and use our services.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
            <p className="mb-4">We may collect personally identifiable information that you voluntarily provide when you:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Fill out contact forms on our website</li>
              <li>Book ambulance or patient transport services</li>
              <li>Register for first aid training courses</li>
              <li>Contact us via email, phone, or social media</li>
            </ul>

            <p className="mb-4"><strong>Information collected may include:</strong></p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Full name, phone number, and email address</li>
              <li>Physical address</li>
              <li>Medical information (only when necessary for service provision)</li>
              <li>Emergency contact details</li>
              <li>Service preferences and payment information</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Medical Information</h3>
            <p className="mb-6">
              For patient transport services, we may collect limited medical information necessary to provide safe and
              appropriate care. All medical information is treated with the highest confidentiality in accordance with
              healthcare privacy standards.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Service Provision:</strong> To provide ambulance and patient transport services, coordinate emergency response, and ensure appropriate medical care</li>
              <li><strong>Communication:</strong> To respond to your inquiries, send service confirmations, and provide customer support</li>
              <li><strong>Improvement:</strong> To improve our website and services, and enhance user experience</li>
              <li><strong>Legal Obligations:</strong> To comply with legal requirements and ensure safety</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">How We Share Your Information</h2>
            <p className="mb-4">We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Healthcare Providers:</strong> When coordinating patient care and transfers</li>
              <li><strong>Emergency Services:</strong> When required for emergency response</li>
              <li><strong>Service Providers:</strong> Trusted third-party providers who assist in operating our website and business</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Your Data Protection Rights</h2>
            <p className="mb-4">You have the following rights:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Right to Access:</strong> Request copies of your personal information</li>
              <li><strong>Right to Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Right to Object:</strong> Object to processing for marketing purposes</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Cookies and Tracking</h2>
            <p className="mb-6">
              Our website uses cookies to enhance your browsing experience. Essential cookies are required for the site
              to function. Analytics cookies help us improve user experience. You can control cookies through your
              browser settings. See our <a href="/cookie-policy" className="text-primary hover:text-primary-light">Cookie Policy</a> for more details.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p className="mb-4">If you have questions about this Privacy Policy or our data practices, contact us:</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p><strong>STJ Southern Ambulance</strong><br />
              No2f, Prof M.D. Rathnasooriya Mawatha<br />
              Galle 80000, Sri Lanka</p>
              <p className="mt-4">
                <strong>Email:</strong> <a href="mailto:ambulance.stj@gmail.com" className="text-primary hover:text-primary-light">ambulance.stj@gmail.com</a><br />
                <strong>Phone:</strong> <a href="tel:+94772826946" className="text-primary hover:text-primary-light">077 282 6946</a>
              </p>
            </div>

            <p className="text-sm text-gray-600 mt-8">
              <strong>Note:</strong> This privacy policy is subject to periodic updates. Continued use of our services
              after changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
