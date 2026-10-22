import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
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
        display: ["Fraunces", "Georgia", "Times New Roman", "serif"],
        body: ["Onest", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Onest", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        reel: ["Cormorant Garamond", "Georgia", "serif"],
      },
      colors: {
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
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* restful.com named palette extras for convenience */
        forest: {
          DEFAULT: "hsl(135 30% 18%)",
          50: "#eaf5ee",
          100: "#d1ecd9",
          200: "#a8d8b8",
          500: "#2d9c5b",
          700: "#1a6e3e",
          800: "#115230",
          900: "#0a3620",
        },
        sage: {
          DEFAULT: "hsl(135 36% 35%)",
          50: "#eaf5ee",
          100: "#d1ecd9",
          200: "#a8d8b8",
          500: "#2d9c5b",
          700: "#1a6e3e",
        },
        terra: {
          DEFAULT: "hsl(20 52% 44%)",
          50: "#fef3f0",
          100: "#ffe4da",
          200: "#ffbf9d",
          500: "#c2522b",
          700: "#8a331c",
        },
        mint: {
          DEFAULT: "hsl(140 50% 85%)",
          50: "#d0e8d8",
          100: "#a1d1b3",
          200: "#72ba8f",
        },
        paper: {
          DEFAULT: "hsl(140 20% 98%)",
          950: "#f5faf6",
        },
      },
      backgroundImage: {
        "gradient-forest": "var(--gradient-forest)",
        "gradient-sage": "var(--gradient-sage)",
        "gradient-terra": "var(--gradient-terra)",
        "gradient-sage-light": "var(--gradient-sage-light)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius)",
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "bounce-right": { "0%, 100%": { transform: "translateX(0)" }, "50%": { transform: "translateX(10px)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        float: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        floatSlow: { "0%, 100%": { transform: "translateY(0px) rotate(0deg)" }, "50%": { transform: "translateY(-10px) rotate(3deg)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-right": "bounce-right 2s ease-in-out 1",
        fadeIn: "fadeIn 0.25s ease",
        "float": "float 5s ease-in-out infinite",
        "float-slow": "floatSlow 7s ease-in-out infinite",
        "float-delay": "float 5s ease-in-out 1.8s infinite",
      },
      transitionTimingFunction: {
        "bouncy": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
