import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Dark theme tokens — the whole app is written against these
      // three semantic colors, so the indigo/teal dark design flips
      // on here without touching individual pages.
      //
      //   cream  → deep-navy panel surface (was warm paper)
      //   ink    → light slate text (was near-black)
      //   accent → indigo (was terracotta)
      colors: {
        cream: "#0F172A",
        ink: "#E6EAF2",
        accent: "#818CF8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
