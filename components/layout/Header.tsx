"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { HiMenu, HiX, HiPhone } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Fleet", href: "/fleet" },
  { name: "News", href: "/news" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-glass py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container-main">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <Image
                src="/logo-transparent.png"
                alt=""
                width={44}
                height={44}
                priority
                className="h-10 w-10 md:h-11 md:w-11 flex-shrink-0"
              />
              <div className={`hidden sm:flex flex-col leading-none ${scrolled ? "text-navy-950 dark:text-white" : "text-white"}`}>
                <span className="font-black text-[15px] tracking-wider">STJ</span>
                <span className="text-[9px] font-semibold tracking-[0.15em] uppercase opacity-80">Southern Ambulance</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    scrolled
                      ? "text-navy-950 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400"
                      : "text-white hover:text-emerald-300"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                aria-label="Toggle dark mode"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  scrolled
                    ? "bg-surface-container dark:bg-navy-800 text-navy-950 dark:text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {darkMode ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* WhatsApp */}
              <a
                href={getWhatsAppUrl(SITE.whatsapp, "Hello STJ Southern Ambulance, I need assistance.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all"
              >
                <FaWhatsapp className="text-base" />
                <span>WhatsApp</span>
              </a>

              {/* Emergency call */}
              <a
                href={`tel:${SITE.phone}`}
                className="btn-emergency text-sm px-5 py-2.5"
              >
                <HiPhone className="text-base" />
                <span>{SITE.phoneDisplay}</span>
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className={`lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                scrolled
                  ? "bg-surface-container dark:bg-navy-800 text-navy-950 dark:text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {mobileOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="lg:hidden glass border-t border-white/10 mt-2">
            <nav className="container-main py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-navy-950 dark:text-white font-medium hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex gap-3 pt-3 border-t border-surface-container dark:border-navy-800 mt-1">
                <a
                  href={`tel:${SITE.phone}`}
                  onClick={() => setMobileOpen(false)}
                  className="btn-emergency flex-1 justify-center text-sm py-3"
                >
                  <HiPhone />
                  <span>Call Now</span>
                </a>
                <a
                  href={getWhatsAppUrl(SITE.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-full text-sm font-semibold py-3"
                >
                  <FaWhatsapp />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Dark mode in mobile */}
              <button
                onClick={() => { toggleDark(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-navy-950 dark:text-white hover:bg-surface-container dark:hover:bg-navy-800 transition-colors text-sm font-medium"
              >
                <span>{darkMode ? "☀️" : "🌙"}</span>
                <span>{darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-[72px] md:h-[80px]" />
    </>
  );
}
