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
        // Elegant mint-green + gold on a warm ivory ground.
        cream: "#F5F2E9", // warm ivory surface
        ink: "#1c211e", // deep green-charcoal text
        accent: "#0F6B54", // primary — deep mint green
        mint: "#2E9E7E", // lighter mint for soft fills
        gold: "#B8892B", // antique gold — the jewel accent
        "gold-soft": "#C9A24B",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
