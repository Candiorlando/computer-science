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
        // Market-researched palette — trust, growth, stability, clarity.
        cream: "#F8F9FA",         // clean off-white background
        ink: "#2D3748",           // slate text for readability
        accent: "#0F4C5C",        // deep teal — primary trust color
        "accent-light": "#1A6B7F",
        fresh: "#4CAF50",         // fresh green — growth CTA
        "fresh-dark": "#3D8B40",
        sage: "#9CB4A6",          // neutral sage — stability surfaces
        "sage-light": "#C5D5CC",
        gold: "#B8892B",          // retained for legacy components
        "gold-soft": "#C9A24B",
        mint: "#2E9E7E",          // retained for legacy gradient
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
