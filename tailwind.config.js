
import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./supabase/**",
    "!./node_modules/**",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-heading)', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'shine': 'shine 2s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'shine': {
          '0%': { 'background-position': '0% 0%' },
          '100%': { 'background-position': '-200% 0%' },
        },
      }
    }
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#F8F9FA", // Rich off-white page background
            content1: "#FFFFFF", // Pure white for elevated cards
            foreground: "#212529", // Deep slate for primary text
            primary: {
              DEFAULT: "#000000", // Pure black for stark CTA buttons
              foreground: "#FFFFFF", 
            },
            secondary: {
              DEFAULT: "#E9ECEF", // Secondary subtle buttons
              foreground: "#212529",
            },
            divider: "#DEE2E6", // Subtle 1px borders
            focus: "#6C757D",
          },
        },
        dark: {
          colors: {
            background: "#212529", // Dark slate background (anti-eyestrain)
            content1: "#343A40", // Elevated dark cards
            foreground: "#F8F9FA", // Crisp off-white primary text
            primary: {
              DEFAULT: "#FFFFFF", // Pure white CTA buttons
              foreground: "#212529", 
            },
            secondary: {
              DEFAULT: "#495057", // Secondary dark buttons
              foreground: "#F8F9FA",
            },
            divider: "#495057", // Subtle dark borders
            focus: "#ADB5BD",
          },
        }
      }
    })
  ],
}

