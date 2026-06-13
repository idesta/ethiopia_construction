import type { Config } from "tailwindcss";

/**
 * Modern-Heritage Fusion — Tailwind theme
 * Heritage gold + polished concrete / steel / glass neutrals,
 * elegant serif (Fraunces) + modern sans (Outfit) pairing.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#d4af37",
          bright: "#e8c766",
          soft: "rgba(212, 175, 55, 0.12)",
        },
        graphite: "#0d0e11",
        steel: "#14161b",
        "steel-blue": "#6f8bab",
        concrete: "#f4f5f7",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Outfit"', "system-ui", "sans-serif"],
        label: ['"Barlow Condensed"', "sans-serif"],
      },
      letterSpacing: {
        label: "0.2em",
        eyebrow: "0.35em",
      },
      borderRadius: {
        sharp: "2px",
      },
      transitionTimingFunction: {
        fusion: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fusion-rise": {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "geo-wipe": {
          "0%": { transform: "scaleX(1)" },
          "100%": { transform: "scaleX(0)" },
        },
      },
      animation: {
        "fusion-rise": "fusion-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
