import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import baseConfig from "@cooper/tailwind-config/web";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [...baseConfig.content, "../../packages/ui/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        hanken: ['"Hanken Grotesk"', "sans-serif"],
      },
      colors: {
        // Cooper Gray
        "cooper-gray-400": "#5A5A5A",
        "cooper-gray-300": "#474747",
        "cooper-gray-200": "#E0E0E0",
        "cooper-gray-150": "#E7E7E7",
        "cooper-gray-100": "#F9F9F9",

        // Cooper Blue
        "cooper-blue-800": "#1250B3",
        "cooper-blue-600": "#5682E0",
        "cooper-blue-200": "#DEEAF8",

        // Cooper "Yellow"
        "cooper-yellow-600": "#AFA800",
        "cooper-yellow-500": "#FF9900",
        "cooper-yellow-300": "#FFB545",

        // Cooper "Cream"
        "cooper-cream-200": "#F1EFE6",
        "cooper-cream-100": "#F7F6F2",

        // Deprecated Colors
        "cooper-pink-500": "#EA8FBA",
        "cooper-green-500": "#619518",
        "cooper-red-500": "#F05833",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
