import Image from "next/image";
import Link from "next/link";
import { HiPhone, HiArrowRight } from "react-icons/hi";
import { FaAmbulance, FaPlane, FaCalendarAlt, FaMedkit, FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | STJ Southern Ambulance",
  description: "Patient transport, airport transfers, event medical cover, and first aid training — Galle, Southern Province, Sri Lanka.",
};

const SERVICES = [
  {
    id: "patient-transport",
    icon: FaAmbulance,
    title: "Patient Transport",
    image: "/patient-care/Treating-Patients-1.jpg",
    tagline: "Safe, professional inter-hospital and emergency transport",
    details: [
      "Emergency and non-emergency patient transport",
      "Inter-hospital and inter-city transfers",
      "Trained paramedics on board every trip",
      "Oxygen, suction, and AED equipment on board",
      "Air-conditioned vehicles with stretcher access",
      "24/7 availability — no advance booking required for emergencies",
    ],
  },
  {
    id: "airport-transfers",
    icon: FaPlane,
    title: "Airport Transfers",
    image: "/fleet/Ambulance-Van-1.jpg",
    tagline: "Medical escort to/from Bandaranaike & Mattala Airport",
    details: [
      "Transfers to/from Bandaranaike International Airport (BIA)",
      "Transfers to/from Mattala Rajapaksa International Airport",
      "Flight coordination and airline liaison",
      "Stretcher and wheelchair-accessible vehicles",
      "Medical escort with certified first responder",
      "Pre-arranged and emergency airport transfers",
    ],
  },
  {
    id: "event-cover",
    icon: FaCalendarAlt,
    title: "Event Medical Cover",
    image: "/events/events.jpg",
    tagline: "Standby ambulance & first aid teams for any event",
    details: [
      "Standby ambulance with full medical equipment",
      "Qualified first aid and paramedic team deployment",
      "Sports events: marathons, cricket, rugby, athletics",
      "Corporate events, school functions, concerts",
      "Community events and religious gatherings",
      "Customised coverage plans with risk assessment",
    ],
  },
  {
    id: "first-aid-training",
    icon: FaMedkit,
    title: "First Aid Training",
    image: "/training/training-7.jpg",
    tagline: "Certified CPR & first aid programs for all groups",
    details: [
      "Basic first aid and CPR certification courses",
      "AED (Automated External Defibrillator) training",
      "School and university programs",
      "Corporate and workplace first aid training",
      "Community group and individual sessions",
      "Certificate issued on successful completion",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-surface dark:bg-navy-950">
      {/* Hero */}
      <section className="relative py-24 bg-navy-gradient text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(ellipse at 70% 50%, rgba(16,185,129,0.4) 0%, transparent 60%)" }}
        />
        <div className="container-main relative text-center">
          <p className="text-label-sm uppercase text-emerald-400 mb-3">What We Offer</p>
          <h1 className="text-display-md font-bold mb-4">Our Services</h1>
          <p className="text-body-lg text-slate-300 max-w-2xl mx-auto">
            Comprehensive emergency medical services across Galle and the Southern Province — available around the clock.
          </p>
        </div>
      </section>

      {/* Services */}
      <div className="container-main py-16 space-y-20">
        {SERVICES.map((service, i) => {
          const Icon = service.icon;
          const isEven = i % 2 === 0;
          return (
            <section
              key={service.id}
              id={service.id}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className={`relative h-72 lg:h-96 rounded-3xl overflow-hidden shadow-glass-lg ${!isEven ? "lg:order-2" : ""}`}>
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-navy-950/40 to-transparent" />
              </div>

              <div className={!isEven ? "lg:order-1" : ""}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-5">
                  <Icon className="text-2xl text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-headline-lg text-navy-950 dark:text-white mb-2">{service.title}</h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-5">{service.tagline}</p>
                <ul className="space-y-2.5 mb-8">
                  {service.details.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-primary">
                    <HiArrowRight /> Get a Quote
                  </Link>
                  <a href={`tel:${SITE.phone}`} className="btn-ghost">
                    <HiPhone /> Call Now
                  </a>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      <section className="bg-navy-gradient text-white py-16">
        <div className="container-main text-center">
          <h2 className="text-headline-lg mb-4">Not Sure What You Need?</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            Call or WhatsApp us — we&apos;ll help you find the right service fast.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${SITE.phone}`} className="btn-emergency">
              <HiPhone /> {SITE.phoneDisplay}
            </a>
            <a
              href={getWhatsAppUrl(SITE.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-6 py-3.5 rounded-full transition-all"
            >
              <FaWhatsapp /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
