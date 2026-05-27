import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HiPhone, HiArrowRight } from "react-icons/hi";
import { FaHeart, FaUsers, FaClock, FaShieldAlt, FaHandsHelping, FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us | STJ Southern Ambulance",
  description: "Meet the team behind STJ Southern Ambulance — serving Galle and the Southern Province of Sri Lanka with professional emergency medical services.",
};

const VALUES = [
  {
    icon: FaHeart,
    title: "Compassion",
    desc: "Every patient is treated with dignity, care, and empathy — from the first call to safe arrival.",
  },
  {
    icon: FaUsers,
    title: "Professionalism",
    desc: "Certified paramedics and first responders trained to international standards of pre-hospital care.",
  },
  {
    icon: FaClock,
    title: "Rapid Response",
    desc: "24/7 dispatch availability — emergencies don't wait, and neither do we.",
  },
  {
    icon: FaShieldAlt,
    title: "Safety First",
    desc: "Modern vehicles, calibrated equipment, and strict protocols on every single call.",
  },
  {
    icon: FaHandsHelping,
    title: "Community",
    desc: "We give back — free medical camps, school first aid programmes, and CSR activities.",
  },
];

const COVERAGE = [
  "Galle", "Hikkaduwa", "Ambalangoda", "Elpitiya",
  "Matara", "Hambantota", "BIA Airport", "Mattala Airport",
];

export default function AboutPage() {
  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen">

      {/* Hero */}
      <section className="relative py-28 bg-navy-gradient text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(ellipse at 60% 50%, rgba(16,185,129,0.5) 0%, transparent 65%)" }}
        />
        <div className="container-main relative text-center">
          <p className="text-label-sm uppercase text-emerald-400 mb-3">Our Story</p>
          <h1 className="text-display-md font-bold mb-4">
            Southern Sri Lanka&apos;s<br />Trusted Medical Team
          </h1>
          <p className="text-body-lg text-slate-300 max-w-2xl mx-auto">
            From a single ambulance in Galle to a comprehensive emergency medical service —
            built on compassion and a promise to always show up.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container-main grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-glass-lg">
            <Image
              src="/team/Team.jpg"
              alt="STJ Southern Ambulance team"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-navy-950/30 to-transparent" />
          </div>

          <div>
            <p className="text-label-sm uppercase text-emerald-600 dark:text-emerald-400 mb-3">About STJ</p>
            <h2 className="text-headline-lg text-navy-950 dark:text-white mb-5">
              Founded on a Promise to Serve
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              <p>
                STJ Southern Ambulance is a leading private ambulance and patient transport service
                based in Galle, Southern Province, Sri Lanka. Rooted in the St. John Ambulance
                tradition, we carry decades of emergency medical expertise into every call.
              </p>
              <p>
                Founded by <strong className="text-navy-950 dark:text-white">Mr. Dasitha Abeyrathna</strong>,
                our mission has always been clear: provide swift, professional, and compassionate
                emergency medical services to our community. What started as a single ambulance
                serving Galle has grown into a full-service provider covering the entire Southern Province.
              </p>
              <p>
                Today our team of trained paramedics, first responders, and support staff works
                around the clock — so that when you need us most, help is always just one call away.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/services" className="btn-primary">
                <HiArrowRight /> Our Services
              </Link>
              <Link href="/contact" className="btn-ghost">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-navy-gradient text-white">
        <div className="container-main grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 mb-4">
              <FaHeart className="text-xl text-emerald-400" />
            </div>
            <h3 className="text-headline-sm text-white mb-3">Our Mission</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              To provide rapid, professional, and compassionate emergency medical services to the
              people of Southern Sri Lanka — ensuring quality pre-hospital care is accessible to all.
            </p>
          </div>

          <div className="glass rounded-3xl p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 mb-4">
              <FaShieldAlt className="text-xl text-emerald-400" />
            </div>
            <h3 className="text-headline-sm text-white mb-3">Our Vision</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              To be the most trusted emergency medical service provider in Sri Lanka, setting
              standards of excellence in patient care, response times, and community safety.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="text-label-sm uppercase text-emerald-600 dark:text-emerald-400 mb-3">What Drives Us</p>
            <h2 className="text-headline-lg text-navy-950 dark:text-white">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="glass-card rounded-2xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 mb-4">
                    <Icon className="text-xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-body-md font-semibold text-navy-950 dark:text-white mb-2">{v.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="py-20 bg-slate-50 dark:bg-navy-900">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="text-label-sm uppercase text-emerald-600 dark:text-emerald-400 mb-3">Ready to Respond</p>
            <h2 className="text-headline-lg text-navy-950 dark:text-white mb-3">Our Fleet</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
              Modern, fully-equipped ambulances maintained to the highest standards —
              stocked with ALS equipment on every deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-glass-lg">
              <Image
                src="/fleet/Ambulance-Van-1.jpg"
                alt="STJ ambulance vehicle"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-glass-lg">
              <Image
                src="/fleet/Ambulance-Three-vans.jpg"
                alt="STJ ambulance fleet"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
            </div>
          </div>

          <div className="text-center">
            <Link href="/fleet" className="btn-primary">
              <HiArrowRight /> View Full Fleet
            </Link>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-20">
        <div className="container-main text-center">
          <p className="text-label-sm uppercase text-emerald-600 dark:text-emerald-400 mb-3">Where We Operate</p>
          <h2 className="text-headline-lg text-navy-950 dark:text-white mb-4">Coverage Area</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 max-w-lg mx-auto">
            Serving the Southern Province and beyond — including airport medical transfers island-wide.
          </p>

          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {COVERAGE.map((town) => (
              <span
                key={town}
                className="px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20"
              >
                {town}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-20 bg-slate-50 dark:bg-navy-900">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="text-label-sm uppercase text-emerald-600 dark:text-emerald-400 mb-3">Giving Back</p>
            <h2 className="text-headline-lg text-navy-950 dark:text-white">Community Engagement</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { src: "/medical-camps/medical-camps.jpg", label: "Free Medical Camps" },
              { src: "/training/training-3.jpg", label: "First Aid Education" },
              { src: "/events/events-2.jpg", label: "Community Events" },
              { src: "/community-service/community-service.jpg", label: "CSR Activities" },
            ].map((item) => (
              <div key={item.label} className="relative h-56 rounded-2xl overflow-hidden shadow-glass-lg group">
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent flex items-end p-4">
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-gradient text-white py-16">
        <div className="container-main text-center">
          <h2 className="text-headline-lg mb-4">Need Our Services?</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto text-sm">
            Call us any time — day or night. We&apos;re always ready to respond.
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
