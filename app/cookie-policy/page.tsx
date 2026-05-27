import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | STJ Southern Ambulance",
  description: "Cookie Policy explaining how STJ Southern Ambulance uses cookies on our website.",
};

export default function CookiePolicyPage() {
  return (
    <div className="mt-20 lg:mt-24">
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last Updated: February 12, 2026</p>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4">What Are Cookies?</h2>
            <p className="mb-6">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website.
              Cookies are widely used to make websites work more efficiently and provide information to website owners.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Cookies</h2>
            <p className="mb-4">STJ Southern Ambulance uses cookies to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Ensure our website functions properly</li>
              <li>Remember your preferences</li>
              <li>Understand how you use our website</li>
              <li>Improve your browsing experience</li>
              <li>Analyze website performance</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Types of Cookies We Use</h2>

            <div className="space-y-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">1. Essential Cookies (Required)</h3>
                <p className="mb-2"><strong>Purpose:</strong> These cookies are necessary for the website to function and cannot be disabled.</p>
                <p className="mb-2"><strong>What they do:</strong></p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li>Enable core functionality</li>
                  <li>Remember your cookie consent preferences</li>
                  <li>Maintain security and prevent fraud</li>
                </ul>
                <p className="text-sm text-gray-600"><strong>Duration:</strong> Session or up to 1 year</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">2. Analytics Cookies (Optional)</h3>
                <p className="mb-2"><strong>Purpose:</strong> Help us understand how visitors use our website.</p>
                <p className="mb-2"><strong>What they do:</strong></p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li>Count website visitors</li>
                  <li>Track which pages are most popular</li>
                  <li>Understand user journey through the site</li>
                  <li>Measure website performance</li>
                </ul>
                <p className="text-sm text-gray-600 mb-2"><strong>Duration:</strong> Up to 2 years</p>
                <p className="text-sm text-gray-600"><strong>You can opt-out:</strong> Yes, through cookie banner or browser settings</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">3. Functional Cookies (Optional)</h3>
                <p className="mb-2"><strong>Purpose:</strong> Enhance website functionality and personalization.</p>
                <p className="mb-2"><strong>What they do:</strong></p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                  <li>Remember your language preference</li>
                  <li>Remember your location</li>
                  <li>Enable social media sharing features</li>
                </ul>
                <p className="text-sm text-gray-600 mb-2"><strong>Duration:</strong> Up to 1 year</p>
                <p className="text-sm text-gray-600"><strong>You can opt-out:</strong> Yes, though some features may not work as well</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">Managing Cookies</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">Browser Settings</h3>
            <p className="mb-4">You can control and delete cookies through your browser settings:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Microsoft Edge:</strong> Settings → Privacy, search, and services → Cookies and site data</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Disabling Cookies</h3>
            <p className="mb-6">
              You can disable cookies entirely, but this may affect website functionality. Forms may not work properly,
              and we won't remember your preferences.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Services</h2>
            <p className="mb-6">
              Some cookies are placed by third-party services such as Google Analytics for website analytics and Google
              Maps for location services. These services have their own privacy policies.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">More Information</h2>
            <p className="mb-4">For more details about your privacy rights, see our <a href="/privacy-policy" className="text-primary hover:text-primary-light">Privacy Policy</a>.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p className="mb-4">Questions about our use of cookies?</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p><strong>STJ Southern Ambulance</strong></p>
              <p className="mt-2">
                <strong>Email:</strong> <a href="mailto:ambulance.stj@gmail.com" className="text-primary hover:text-primary-light">ambulance.stj@gmail.com</a><br />
                <strong>Phone:</strong> <a href="tel:+94772826946" className="text-primary hover:text-primary-light">077 282 6946</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
