"use client";

import { useState } from "react";
import { HiPhone, HiMail, HiLocationMarker, HiClock } from "react-icons/hi";
import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

const SERVICES = [
  { value: "", label: "Select a service…" },
  { value: "patient-transport", label: "Patient Transport" },
  { value: "airport-transfer", label: "Airport Transfer" },
  { value: "event-cover", label: "Event Medical Cover" },
  { value: "first-aid-training", label: "First Aid Training" },
  { value: "general", label: "General Enquiry" },
  { value: "other", label: "Other" },
];

type Status = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", service: "", message: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-surface dark:bg-navy-950 min-h-screen">

      {/* Hero */}
      <section className="py-20 bg-navy-gradient text-white">
        <div className="container-main text-center">
          <p className="text-label-sm uppercase text-emerald-400 mb-3">Reach Us</p>
          <h1 className="text-display-md font-bold mb-3">Get in Touch</h1>
          <p className="text-slate-300 text-body-md">Available 24/7 — for emergencies and enquiries alike.</p>
        </div>
      </section>

      {/* Quick contact chips */}
      <section className="py-10 border-b border-slate-200 dark:border-navy-800">
        <div className="container-main grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: `tel:${SITE.phone}`, icon: HiPhone, label: "Call Us", sub: SITE.phoneDisplay, color: "text-emergency-600 dark:text-emergency-400", bg: "bg-emergency-50 dark:bg-emergency-900/20" },
            { href: getWhatsAppUrl(SITE.whatsapp), icon: FaWhatsapp, label: "WhatsApp", sub: "Message us", color: "text-[#25D366]", bg: "bg-green-50 dark:bg-green-900/20", external: true },
            { href: `mailto:${SITE.email}`, icon: HiMail, label: "Email", sub: SITE.email, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { href: SITE.facebook, icon: FaFacebookMessenger, label: "Messenger", sub: "Chat on Facebook", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", external: true },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="glass-card rounded-2xl p-5 flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}>
                  <Icon className={`text-xl ${item.color}`} />
                </div>
                <p className="text-sm font-semibold text-navy-950 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-16">
        <div className="container-main grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Form */}
          <div>
            <h2 className="text-headline-md text-navy-950 dark:text-white mb-6">Send Us a Message</h2>

            {status === "success" && (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 mb-6 text-emerald-700 dark:text-emerald-300 text-sm">
                Message sent! We&apos;ll get back to you within 2 hours.
              </div>
            )}
            {status === "error" && (
              <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 text-red-700 dark:text-red-300 text-sm">
                Something went wrong. Please call or WhatsApp us directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                <input
                  id="name" name="name" type="text" required value={form.name} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone *</label>
                  <input
                    id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="07X XXX XXXX"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email *</label>
                  <input
                    id="email" name="email" type="email" required value={form.email} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Service Needed</label>
                <select
                  id="service" name="service" value={form.service} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {SERVICES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Message *</label>
                <textarea
                  id="message" name="message" rows={5} required value={form.message} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Tell us about your requirement…"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>

          {/* Info + Map */}
          <div className="space-y-6">
            <h2 className="text-headline-md text-navy-950 dark:text-white">Our Location</h2>

            <div className="glass-card rounded-2xl p-6 space-y-5">
              {[
                { icon: HiLocationMarker, label: "Address", value: SITE.address },
                { icon: HiClock, label: "Hours", value: "24 hours / 7 days — we never close" },
                { icon: HiPhone, label: "Phone", value: SITE.phoneDisplay, href: `tel:${SITE.phone}` },
                { icon: HiMail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="text-lg text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-medium text-navy-950 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-navy-950 dark:text-white">{item.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-glass-lg h-72">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.803123!2d80.21420!3d6.05350!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae173bb6e8c2939%3A0x2d8c5f5a5c43e5f!2sProf%20M.D.%20Rathnasooriya%20Mawatha%2C%20Galle!5e0!3m2!1sen!2slk!4v1707821000000!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="STJ Southern Ambulance — Galle"
              />
            </div>

            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
