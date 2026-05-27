"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiPhone, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import TechWaves from "./TechWaves";

const SLIDES = [
  {
    image: "/hero/hero-slide-1-emergency.jpg",
    mobileImage: "/hero/hero-slide-1-emergency-mobile.jpg",
    tag: "24/7 Emergency Response",
    headline: "Swift Care When\nEvery Second Counts",
    sub: "Southern Sri Lanka's trusted private ambulance service — professional, equipped, and always ready.",
  },
  {
    image: "/patient-care/Treating-Patients-1.jpg",
    mobileImage: "/patient-care/Treating-Patients-1.jpg",
    tag: "Patient Transport",
    headline: "Compassionate Care\nFrom Our Team to You",
    sub: "Safe inter-hospital transfers and emergency transport with trained paramedics and modern equipment.",
  },
  {
    image: "/training/training-7.jpg",
    mobileImage: "/training/training-7.jpg",
    tag: "First Aid Training",
    headline: "Empowering Communities\nThrough Training",
    sub: "Certified CPR and first aid programs for schools, workplaces, and community groups across the South.",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const go = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => setTransitioning(false), 700);
  }, [transitioning]);

  const next = useCallback(() => go((current + 1) % SLIDES.length), [current, go]);
  const prev = useCallback(() => go((current - 1 + SLIDES.length) % SLIDES.length), [current, go]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[90vh] min-h-[600px] max-h-[900px] overflow-hidden bg-navy-950">
      {/* Background images */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-main">
          <div className="max-w-2xl">
            {/* Tag */}
            <div
              key={`tag-${current}`}
              className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 animate-fade-up"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
              {slide.tag}
            </div>

            {/* Headline */}
            <h1
              key={`h1-${current}`}
              className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-up whitespace-pre-line"
              style={{ animationDelay: "80ms" }}
            >
              {slide.headline}
            </h1>

            {/* Sub */}
            <p
              key={`sub-${current}`}
              className="text-slate-200 text-lg leading-relaxed mb-8 max-w-xl animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              {slide.sub}
            </p>

            {/* CTAs */}
            <div
              key={`cta-${current}`}
              className="flex flex-wrap gap-3 animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <a href={`tel:${SITE.phone}`} className="btn-emergency">
                <HiPhone className="text-lg" />
                Call Now: {SITE.phoneDisplay}
              </a>
              <a
                href={getWhatsAppUrl(SITE.whatsapp, "Hello, I need ambulance assistance.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-6 py-3.5 rounded-full transition-all hover:-translate-y-0.5 shadow-lg"
              >
                <FaWhatsapp className="text-lg" />
                WhatsApp Us
              </a>
              <Link href="/services" className="btn-ghost text-white border-white/30 hover:border-emerald-400 hover:text-emerald-300">
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-emerald-400" : "w-3 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Prev/Next */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all"
      >
        <HiChevronLeft className="text-xl" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all"
      >
        <HiChevronRight className="text-xl" />
      </button>

      {/* Tech waves at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none">
        <TechWaves color="#10b981" />
      </div>
    </section>
  );
}
