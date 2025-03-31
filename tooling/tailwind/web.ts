import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import { fontFamily } from "tailwindcss/defaultTheme";

import base from "./base";

export default {
  content: base.content,
  presets: [base],
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
      },
      colors: {
        // Cooper Gray
        "cooper-gray-400": "#5A5A5A",
        "cooper-gray-300": "#474747",
        "cooper-gray-200": "#E0E0E0",
        "cooper-gray-100": "#F7F7F7",

        // Cooper Blue
        "cooper-blue-800": "#1B67E0",
        "cooper-blue-600": "#72A0E8",
        "cooper-blue-200": "#DEEAF8",

        // Cooper "Yellow"
        "cooper-yellow-600": "#AFA800",
        "cooper-yellow-500": "#FF9900",
        "cooper-yellow-300": "#FFBF47",

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
          DEFAULT: "#1B67E0",
          foreground: "#1B67E0",
        },
        secondary: {
          DEFAULT: "#72A0E8",
          foreground: "#72A0E8",
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
  plugins: [animate],
} satisfies Config;
