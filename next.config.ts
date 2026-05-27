import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",   value: "on" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "X-Frame-Options",          value: "SAMEORIGIN" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    // PayHere sandbox + live domains needed for form POST and iframe
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",   // unsafe-inline needed for dark-mode bootstrap script
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com",
      "frame-src https://www.google.com https://sandbox.payhere.lk https://www.payhere.lk",
      "connect-src 'self' https://sandbox.payhere.lk https://payhere.lk",
      "form-action 'self' https://sandbox.payhere.lk https://www.payhere.lk",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  output: "standalone",
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
