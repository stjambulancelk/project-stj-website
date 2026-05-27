"use client";

import Link from "next/link";
import Image from "next/image";
import { HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";
import { FaWhatsapp, FaFacebook, FaMapMarkerAlt } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

const QUICK_LINKS = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Fleet", href: "/fleet" },
  { name: "News", href: "/news" },
  { name: "Contact", href: "/contact" },
];

const SERVICES_LINKS = [
  { name: "Patient Transport", href: "/services#patient-transport" },
  { name: "Airport Transfers", href: "/services#airport-transfers" },
  { name: "Event Medical Cover", href: "/services#event-cover" },
  { name: "First Aid Training", href: "/services#first-aid-training" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      {/* Top section */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/">
              <Image
                src="/logo-nav.png"
                alt="STJ Southern Ambulance"
                width={160}
                height={64}
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Southern Sri Lanka&rsquo;s trusted private ambulance service. Professional care, swift response — available 24/7.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={SITE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#1877F2] flex items-center justify-center transition-colors"
              >
                <FaFacebook className="text-sm" />
              </a>
              <a
                href={getWhatsAppUrl(SITE.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#25D366] flex items-center justify-center transition-colors"
              >
                <FaWhatsapp className="text-sm" />
              </a>
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Maps"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-emergency-600 flex items-center justify-center transition-colors"
              >
                <FaMapMarkerAlt className="text-sm" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-label-sm uppercase text-emerald-400 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-label-sm uppercase text-emerald-400 mb-4">Services</h3>
            <ul className="space-y-2">
              {SERVICES_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-label-sm uppercase text-emerald-400 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${SITE.phone}`}
                  className="flex items-start gap-2.5 text-slate-400 hover:text-emerald-400 text-sm transition-colors"
                >
                  <HiPhone className="mt-0.5 flex-shrink-0 text-emerald-500" />
                  <span>{SITE.phoneDisplay}<br /><span className="text-slate-500">24 Hours / 7 Days</span></span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-start gap-2.5 text-slate-400 hover:text-emerald-400 text-sm transition-colors"
                >
                  <HiMail className="mt-0.5 flex-shrink-0 text-emerald-500" />
                  <span>{SITE.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400 text-sm">
                <HiLocationMarker className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>{SITE.address}</span>
              </li>
            </ul>

            <div className="mt-6">
              <p className="text-xs text-slate-500 mb-2">Google Rating</p>
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400 text-sm">★★★★★</span>
                <span className="text-white font-semibold text-sm">{SITE.googleRating}</span>
                <span className="text-slate-500 text-xs">({SITE.googleReviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} STJ Southern Ambulance. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
