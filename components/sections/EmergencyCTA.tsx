"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { HiPhone } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import TechWaves from "./TechWaves";

export default function EmergencyCTA() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("revealed");
      }),
      { threshold: 0.2 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-20 bg-emerald-gradient text-white overflow-hidden"
    >
      {/* Background wave decoration */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true"
        style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)" }}
      />
      <TechWaves color="#ffffff" className="opacity-10" />

      <div className="container-main relative z-10 text-center">
        {/* Pulse ring */}
        <div className="inline-flex items-center justify-center mb-6 reveal">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <HiPhone className="text-2xl text-white" />
            </div>
            <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          </div>
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold mb-4 reveal" style={{ transitionDelay: "80ms" }}>
          Need Emergency Medical Transport?
        </h2>
        <p className="text-xl text-emerald-100 mb-10 max-w-xl mx-auto reveal" style={{ transitionDelay: "160ms" }}>
          We&rsquo;re here 24/7 — call now for immediate dispatch or WhatsApp us to arrange non-emergency transport.
        </p>

        <div className="flex flex-wrap justify-center gap-4 reveal" style={{ transitionDelay: "240ms" }}>
          <a
            href={`tel:${SITE.phone}`}
            className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-4 rounded-full text-lg transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <HiPhone className="text-xl" />
            {SITE.phoneDisplay}
          </a>
          <a
            href={getWhatsAppUrl(SITE.whatsapp, "Hello, I need to arrange medical transport.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold px-8 py-4 rounded-full text-lg transition-all hover:-translate-y-1"
          >
            <FaWhatsapp className="text-xl" />
            WhatsApp Us
          </a>
          <Link
            href="/contact"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-8 py-4 rounded-full text-lg transition-all hover:-translate-y-1"
          >
            Request a Quote
          </Link>
        </div>
      </div>
    </section>
  );
}
