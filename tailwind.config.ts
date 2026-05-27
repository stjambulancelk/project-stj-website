import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vital Guard — Medical Emerald (primary actions, health, trust)
        emerald: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6de",
          300: "#5eead4",
          400: "#2dd4b0",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        // Vital Guard — Deep Navy (brand, headers, dark surfaces)
        navy: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#bdd0fe",
          300: "#93acfc",
          400: "#6680f8",
          500: "#4154f1",
          600: "#2d33e6",
          700: "#2527cb",
          800: "#1e2082",
          900: "#1a1d6e",
          950: "#0f172a",
        },
        // Vital Guard — Emergency Red (urgent CTAs, critical alerts)
        emergency: {
          50: "#fff1f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        // Surfaces (light mode)
        surface: {
          DEFAULT: "#f8f9ff",
          low: "#eff4ff",
          container: "#e5eeff",
          high: "#dce9ff",
          dim: "#cbdbf5",
        },
        // Keep legacy names for old components during migration
        primary: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
        accent: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg": ["1.875rem", { lineHeight: "1.3", fontWeight: "600" }],
        "headline-md": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "label-sm": ["0.875rem", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        glass: "0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 4px rgba(15, 23, 42, 0.04)",
        "glass-lg": "0 8px 40px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)",
        "glass-hover": "0 12px 48px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08)",
        emerald: "0 4px 24px rgba(16, 185, 129, 0.25)",
        emergency: "0 4px 24px rgba(239, 68, 68, 0.25)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, rgba(15,23,42,0.90) 0%, rgba(15,23,42,0.55) 50%, rgba(6,95,70,0.35) 100%)",
        "emerald-gradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "navy-gradient": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      },
      animation: {
        "wave-flow": "waveFlow 8s ease-in-out infinite",
        "wave-flow-delay": "waveFlow 8s ease-in-out 2s infinite",
        "wave-flow-slow": "waveFlow 12s ease-in-out 4s infinite",
        "fade-up": "fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        waveFlow: {
          "0%, 100%": { transform: "translateY(0) scaleX(1)", opacity: "0.6" },
          "50%": { transform: "translateY(-20px) scaleX(1.05)", opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
