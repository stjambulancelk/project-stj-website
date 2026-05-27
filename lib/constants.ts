// ============================================================
// App-wide constants — single source of truth
// ============================================================

export const SITE = {
  name: "STJ Southern Ambulance",
  tagline: "Your Trusted Partner in Emergency Care",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://stj.lk",
  phone: "+94772826946",
  phoneDisplay: "077 282 6946",
  whatsapp: "94772826946",
  email: "info@stj.lk",
  emailAlt: "ambulance.stj@gmail.com",
  facebook: "https://www.facebook.com/stj.ambulance",
  mapsUrl: "https://maps.app.goo.gl/9pBn6fiGNUAc9fGE6",
  address: "No2f, Prof M.D. Rathnasooriya Mawatha, Galle 80000, Sri Lanka",
  addressShort: "Galle, Southern Province, Sri Lanka",
  googleRating: "5.0",
  googleReviewCount: 28,
} as const;

export const PAYHERE = {
  merchantId: process.env.PAYHERE_MERCHANT_ID ?? "",
  merchantSecret: process.env.PAYHERE_MERCHANT_SECRET ?? "",
  isSandbox: process.env.PAYHERE_SANDBOX === "true",
  baseUrl: process.env.PAYHERE_BASE_URL ?? "https://sandbox.payhere.lk/pay/checkout",
  currency: "LKR",
  notifyUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook`,
  returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/invoice`,
  cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/invoice`,
} as const;

export const STORAGE = {
  // Persistent Railway volume mount path
  uploadDir: process.env.UPLOAD_PATH ?? "/data/uploads",
  // Max file size for CMS uploads (5 MB)
  maxFileSizeMb: 5,
  maxFileSizeBytes: 5 * 1024 * 1024,
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

export const AUDIT = {
  retentionDays: 90,
  dailySalt: process.env.AUDIT_DAILY_SALT ?? "change-me",
} as const;

export const SERVICES = [
  {
    id: "patient-transport",
    title: "Patient Transport",
    slug: "patient-transport",
    icon: "ambulance",
    image: "/patient-care/Treating-Patients-1.jpg",
    shortDesc: "Safe inter-hospital transfers and emergency medical transport with professional care.",
  },
  {
    id: "airport-transfers",
    title: "Airport Transfers",
    slug: "airport-transfers",
    icon: "plane",
    image: "/fleet/Ambulance-Van-1.jpg",
    shortDesc: "Medical transfers to/from BIA and Mattala with full support en route.",
  },
  {
    id: "event-cover",
    title: "Event Medical Cover",
    slug: "event-cover",
    icon: "calendar",
    image: "/events/events.jpg",
    shortDesc: "Standby ambulance and first aid teams for sports, corporate, and community events.",
  },
  {
    id: "first-aid-training",
    title: "First Aid Training",
    slug: "first-aid-training",
    icon: "medkit",
    image: "/training/training-7.jpg",
    shortDesc: "Certified CPR and first aid programs for schools, workplaces, and groups.",
  },
] as const;

export const INVOICE_CHARGE_ITEMS = [
  "Base Charge",
  "Oxygen Supply",
  "Suction Service",
  "Medical Escort",
  "Night Surcharge",
  "Long Distance Surcharge",
  "Equipment Usage",
  "Other",
] as const;

export const INVOICE_STATUS = {
  PENDING: "PENDING",
  SENT: "SENT",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  ON_HOLD: "ON_HOLD",
} as const;

export const ADMIN_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  DISPATCHER: "DISPATCHER",
  VIEWER: "VIEWER",
} as const;
