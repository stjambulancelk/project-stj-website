"use client";

import { useEffect, useRef } from "react";
import { FaStar, FaClock, FaUserMd, FaAmbulance } from "react-icons/fa";

const FEATURES = [
  {
    icon: FaStar,
    title: "5.0★ Google Rating",
    desc: "Rated excellent by 28+ satisfied patients and families across Southern Province.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: FaClock,
    title: "24/7 Availability",
    desc: "Round-the-clock emergency response and patient transport, every day of the year.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: FaUserMd,
    title: "Trained Professionals",
    desc: "Experienced paramedics and first aid specialists with St. John Ambulance heritage.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: FaAmbulance,
    title: "Modern Equipment",
    desc: "Advanced life support ambulances with modern medical equipment and oxygen supply.",
    color: "text-emergency-500",
    bg: "bg-emergency-500/10",
  },
];

export default function WhyChooseUs() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("revealed");
      }),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-pad bg-surface dark:bg-navy-900 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" aria-hidden="true"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)", backgroundSize: "32px 32px" }}
      />

      <div className="container-main relative">
        {/* Header */}
        <div className="text-center mb-14 reveal" style={{ transitionDelay: "0ms" }}>
          <p className="text-label-sm uppercase text-emerald-600 dark:text-emerald-400 mb-3">Why Choose STJ</p>
          <h2 className="text-headline-lg text-navy-950 dark:text-white mb-4">
            Southern Sri Lanka&rsquo;s Most Trusted<br className="hidden sm:block" /> Ambulance Service
          </h2>
          <p className="text-body-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            When every second counts, you need a team you can rely on. Here&rsquo;s why families and hospitals across the South choose STJ.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass-card p-8 text-center reveal"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${f.bg} mb-5`}>
                <f.icon className={`text-2xl ${f.color}`} />
              </div>
              <h3 className="text-headline-md text-navy-950 dark:text-white mb-3">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
