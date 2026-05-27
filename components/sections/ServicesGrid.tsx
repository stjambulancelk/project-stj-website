"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { FaAmbulance, FaPlane, FaCalendarAlt, FaMedkit } from "react-icons/fa";
import { SERVICES } from "@/lib/constants";

const ICON_MAP = {
  ambulance: FaAmbulance,
  plane: FaPlane,
  calendar: FaCalendarAlt,
  medkit: FaMedkit,
};

export default function ServicesGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("revealed");
      }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-pad bg-white dark:bg-navy-950 relative overflow-hidden">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <p className="text-label-sm uppercase text-emerald-600 dark:text-emerald-400 mb-3">How We Serve You</p>
          <h2 className="text-headline-lg text-navy-950 dark:text-white mb-4">
            Comprehensive Medical Services<br className="hidden sm:block" /> for Southern Province
          </h2>
          <p className="text-body-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            From emergency response to planned medical transport, we cover every need with professionalism and care.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon as keyof typeof ICON_MAP] ?? FaAmbulance;
            return (
              <div
                key={service.id}
                className="group glass-card overflow-hidden reveal"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden rounded-t-3xl -mx-0">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 mb-4">
                    <Icon className="text-xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-headline-md text-navy-950 dark:text-white mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {service.shortDesc}
                  </p>
                  <Link
                    href={`/services#${service.slug}`}
                    className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm group-hover:gap-2.5 transition-all"
                  >
                    Learn More <HiArrowRight className="text-base transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 reveal">
          <Link href="/services" className="btn-primary">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
