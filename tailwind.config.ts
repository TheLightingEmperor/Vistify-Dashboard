import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', "Inter", "ui-sans-serif", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
        brand: ["Georgia", '"Times New Roman"', "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        canvas: "hsl(var(--canvas))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          dark: "hsl(var(--primary-dark))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        amber: { DEFAULT: "hsl(var(--amber))", soft: "hsl(var(--amber-soft))", foreground: "hsl(var(--amber-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 3px)",
        sm: "calc(var(--radius) - 9px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(18 58 60 / 0.06)",
        card: "0 7px 20px rgb(18 58 60 / 0.09)",
      },
      keyframes: {
        "row-pulse": {
          "0%": { boxShadow: "inset 0 0 0 2px hsl(var(--primary) / 0.7)" },
          "100%": { boxShadow: "inset 0 0 0 2px hsl(var(--primary) / 0)" },
        },
      },
      animation: { "row-pulse": "row-pulse 1.6s ease-out 2" },
    },
  },
  plugins: [animate],
};

export default config;
