import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HiPhone, HiArrowRight } from "react-icons/hi";
import { FaAmbulance, FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Fleet | STJ Southern Ambulance",
  description: "Modern ambulances and medical equipment — STJ Southern Ambulance fleet serving Galle and the Southern Province of Sri Lanka.",
};

const EQUIPMENT = [
  { cat: "Life Support", items: ["Advanced cardiac monitor / defibrillator (AED)", "Portable ventilator", "Pulse oximeter & capnography", "BP & ECG monitoring"] },
  { cat: "Airway & Oxygen", items: ["Non-rebreather mask & nasal cannula", "Suction unit (manual + powered)", "Laryngoscope & intubation kit", "Portable oxygen cylinder (D-size)"] },
  { cat: "Patient Handling", items: ["Hydraulic stretcher with safety rails", "Scoop stretcher for trauma", "Wheelchair-accessible loading", "Cervical spine collars (multi-size)"] },
  { cat: "Supplies", items: ["IV cannulation & fluid therapy set", "Wound care & trauma dressings", "Splints, bandages, and burn dressings", "Personal Protective Equipment (PPE)"] },
];

export default function FleetPage() {
  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen">

      {/* Hero */}
      <section className="relative py-24 bg-navy-gradient text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.5) 0%, transparent 65%)" }}
        />
        <div className="container-main relative">
          <div className="max-w-2xl">
            <p className="text-label-sm uppercase text-emerald-400 mb-3">Always Ready</p>
            <h1 className="text-display-md font-bold mb-4">Our Fleet &amp; Equipment</h1>
            <p className="text-body-lg text-slate-300">
              Modern ambulances maintained to the highest standards — fully equipped for
              emergency response, inter-hospital transfers, and airport medical missions.
            </p>
          </div>
        </div>
      </section>

      {/* Fleet photos */}
      <section className="py-20">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="text-label-sm uppercase text-emerald-600 dark:text-emerald-400 mb-3">The Vehicles</p>
            <h2 className="text-headline-lg text-navy-950 dark:text-white">Ambulance Fleet</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-80 rounded-3xl overflow-hidden shadow-glass-lg group">
              <Image
                src="/fleet/Ambulance-Van-1.jpg"
                alt="STJ ambulance — fully equipped transport vehicle"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent flex items-end p-6">
                <div>
                  <p className="text-white font-semibold text-lg">Type B Ambulance</p>
                  <p className="text-slate-300 text-sm">Patient transport & inter-hospital transfers</p>
                </div>
              </div>
            </div>

            <div className="relative h-80 rounded-3xl overflow-hidden shadow-glass-lg group">
              <Image
                src="/fleet/Ambulance-Three-vans.jpg"
                alt="STJ Southern Ambulance fleet — three vehicles"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent flex items-end p-6">
                <div>
                  <p className="text-white font-semibold text-lg">Multi-Vehicle Fleet</p>
                  <p className="text-slate-300 text-sm">Multiple units for concurrent deployments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Air Conditioned", desc: "Climate-controlled patient compartment" },
              { label: "24/7 Deployment", desc: "Vehicles always fuelled and inspection-ready" },
              { label: "GPS Tracked", desc: "Real-time dispatch monitoring" },
              { label: "Regularly Serviced", desc: "Scheduled maintenance & deep clean" },
            ].map((item) => (
              <div key={item.label} className="glass-card rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <FaAmbulance className="text-lg text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-navy-950 dark:text-white mb-1">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="py-20 bg-navy-gradient text-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="text-label-sm uppercase text-emerald-400 mb-3">On Every Vehicle</p>
            <h2 className="text-headline-lg text-white">Medical Equipment</h2>
            <p className="text-slate-300 text-sm mt-3 max-w-xl mx-auto">
              Every ambulance is stocked and checked before each deployment — nothing is left to chance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EQUIPMENT.map((section) => (
              <div key={section.cat} className="glass rounded-2xl p-6">
                <p className="text-label-sm uppercase text-emerald-400 mb-4">{section.cat}</p>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-main text-center">
          <h2 className="text-headline-lg text-navy-950 dark:text-white mb-3">Need an Ambulance?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-md mx-auto">
            Our dispatch team is ready around the clock. Call for emergencies or WhatsApp to request a non-urgent booking.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${SITE.phone}`} className="btn-emergency">
              <HiPhone /> Call {SITE.phoneDisplay}
            </a>
            <a
              href={getWhatsAppUrl(SITE.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-6 py-3.5 rounded-full transition-all"
            >
              <FaWhatsapp /> WhatsApp
            </a>
            <Link href="/contact" className="btn-ghost">
              <HiArrowRight /> Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
