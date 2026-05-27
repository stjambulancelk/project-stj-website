"use client";

import { HiPhone } from "react-icons/hi";
import { FaWhatsapp, FaFacebookMessenger, FaEnvelope, FaSms } from "react-icons/fa";

const ContactStrip = () => {
  const contactMethods = [
    {
      name: "Call",
      icon: HiPhone,
      href: "tel:+94772826946",
      color: "bg-accent hover:bg-accent-light",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      href: "https://wa.me/94772826946",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Messenger",
      icon: FaFacebookMessenger,
      href: "https://m.me/stj.ambulance",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Email",
      icon: FaEnvelope,
      href: "mailto:ambulance.stj@gmail.com",
      color: "bg-gray-600 hover:bg-gray-700",
    },
    {
      name: "SMS",
      icon: FaSms,
      href: "sms:+94772826946",
      color: "bg-primary hover:bg-primary-light",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg lg:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        {contactMethods.map((method) => {
          const Icon = method.icon;
          return (
            <a
              key={method.name}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`flex flex-col items-center justify-center py-3 rounded-lg text-white ${method.color} transition-colors`}
            >
              <Icon className="text-2xl mb-1" />
              <span className="text-xs font-medium">{method.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default ContactStrip;
