"use client";

import { HiPhone } from "react-icons/hi";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { SITE } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

const ACTIONS = [
  {
    label: "Call",
    href: `tel:${SITE.phone}`,
    icon: HiPhone,
    bg: "bg-emergency-500 hover:bg-emergency-600",
    external: false,
  },
  {
    label: "WhatsApp",
    href: getWhatsAppUrl(SITE.whatsapp, "Hello STJ Southern Ambulance, I need assistance."),
    icon: FaWhatsapp,
    bg: "bg-[#25D366] hover:bg-[#1ebe5d]",
    external: true,
  },
  {
    label: "Facebook",
    href: SITE.facebook,
    icon: FaFacebook,
    bg: "bg-[#1877F2] hover:bg-[#166fe5]",
    external: true,
  },
  {
    label: "Email",
    href: `mailto:${SITE.email}`,
    icon: MdEmail,
    bg: "bg-emerald-500 hover:bg-emerald-600",
    external: false,
  },
];

export default function MobileActionBar() {
  return (
    <div className="mobile-action-bar lg:hidden">
      {ACTIONS.map((action) => (
        <a
          key={action.label}
          href={action.href}
          target={action.external ? "_blank" : undefined}
          rel={action.external ? "noopener noreferrer" : undefined}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-white transition-all active:scale-95 ${action.bg}`}
          aria-label={action.label}
        >
          <action.icon className="text-xl" />
          <span className="text-[10px] font-semibold leading-none">{action.label}</span>
        </a>
      ))}
    </div>
  );
}
