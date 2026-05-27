import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileActionBar from "@/components/layout/MobileActionBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "STJ Southern Ambulance | 24/7 Emergency Service — Galle, Sri Lanka",
  description:
    "Professional ambulance and patient transport in Galle, Southern Province. 24/7 emergency response, airport transfers, event medical cover, first aid training. Call 077 282 6946.",
  keywords: [
    "ambulance service Galle",
    "private ambulance Sri Lanka",
    "patient transport Southern Province",
    "emergency medical service Galle",
    "airport ambulance transfer Sri Lanka",
    "first aid training Galle",
    "STJ Southern Ambulance",
    "stj.lk",
  ],
  authors: [{ name: "STJ Southern Ambulance" }],
  creator: "STJ Southern Ambulance",
  publisher: "STJ Southern Ambulance",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stj.lk",
    title: "STJ Southern Ambulance | 24/7 Emergency Service",
    description:
      "Professional ambulance and patient transport in Galle, Southern Province. Available 24/7.",
    siteName: "STJ Southern Ambulance",
    images: [
      {
        url: "/logo-og.png",
        width: 1200,
        height: 630,
        alt: "STJ Southern Ambulance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "STJ Southern Ambulance | 24/7 Emergency Service",
    description:
      "Professional ambulance and patient transport in Galle, Southern Province. Call 077 282 6946.",
    images: ["/logo-og.png"],
  },
  alternates: {
    canonical: "https://stj.lk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Dark mode: apply class before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme:dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased bg-surface dark:bg-navy-950 text-on-surface transition-colors duration-300">
        <Header />
        <main className="min-h-screen">{children}</main>
        <MobileActionBar />
        <Footer />
      </body>
    </html>
  );
}
