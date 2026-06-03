import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Westside Lexus / GST Data & AI palette: deep graphite + Lexus-inspired
        // metallic, with an energizing electric-teal accent for the AI layer.
        ink: {
          DEFAULT: "#0b1220",
          soft: "#131c2e",
          line: "#1f2a3d",
        },
        steel: {
          50: "#f5f7fa",
          100: "#e9eef4",
          200: "#cdd7e3",
          300: "#a6b6c9",
          400: "#7388a3",
          500: "#516780",
          600: "#3c4f66",
          700: "#2c3b4d",
          800: "#1f2a3d",
          900: "#131c2e",
        },
        accent: {
          DEFAULT: "#18c5b6",
          soft: "#5fe3d7",
          deep: "#0f8f84",
        },
        gold: {
          DEFAULT: "#d8b25e",
          soft: "#ecd29a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
        glow: "0 0 0 1px rgba(24,197,182,0.4), 0 8px 30px rgba(24,197,182,0.15)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "bar-fill": {
          from: { width: "0%" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "bar-fill": "bar-fill 0.8s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
