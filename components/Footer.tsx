import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <Image
              src="/logo-white-bg.png"
              alt="STJ Southern Ambulance"
              width={180}
              height={60}
              className="mb-4 h-12 w-auto"
            />
            <p className="text-sm mb-4">
              Your Trusted Partner in Emergency Care. Professional ambulance and patient transport
              service serving Southern Sri Lanka 24/7.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/stj.ambulance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-light transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary-light transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-light transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary-light transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-primary-light transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-light transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services#patient-transport" className="hover:text-primary-light transition-colors">
                  Patient Transport
                </Link>
              </li>
              <li>
                <Link href="/services#airport-transfers" className="hover:text-primary-light transition-colors">
                  Airport Transfers
                </Link>
              </li>
              <li>
                <Link href="/services#event-cover" className="hover:text-primary-light transition-colors">
                  Event Medical Cover
                </Link>
              </li>
              <li>
                <Link href="/services#training" className="hover:text-primary-light transition-colors">
                  First Aid Training
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaPhone className="text-primary-light mt-1 flex-shrink-0" />
                <a href="tel:+94772826946" className="hover:text-primary-light transition-colors">
                  077 282 6946
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <FaEnvelope className="text-primary-light mt-1 flex-shrink-0" />
                <a
                  href="mailto:ambulance.stj@gmail.com"
                  className="hover:text-primary-light transition-colors"
                >
                  ambulance.stj@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-primary-light mt-1 flex-shrink-0" />
                <span className="text-sm">
                  No2f, Prof M.D. Rathnasooriya Mawatha
                  <br />
                  Galle 80000, Sri Lanka
                </span>
              </li>
            </ul>
            <p className="mt-4 text-sm">
              <span className="text-white font-semibold">Operating Hours:</span>
              <br />
              24 Hours / 7 Days
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p className="mb-2">
            © {currentYear} STJ Southern Ambulance. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center space-x-4 mt-2">
            <Link href="/privacy-policy" className="hover:text-primary-light transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-primary-light transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="hover:text-primary-light transition-colors">
              Cookie Policy
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-gray-400">
              Developed by{" "}
              <a
                href="https://cdazzdev.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-light hover:text-primary transition-colors font-medium"
              >
                Ceylon Dazzling Dev Holding (Pvt) Ltd.
              </a>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              <a href="mailto:info@cdazzdev.com" className="hover:text-primary-light transition-colors">
                info@cdazzdev.com
              </a>{" "}
              |{" "}
              <a href="tel:+94788855086" className="hover:text-primary-light transition-colors">
                +94 78 885 5086
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
