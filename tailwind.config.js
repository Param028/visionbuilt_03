
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
  // Force dark mode only — no light mode
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', 'Inter', 'sans-serif'],
        satoshi: ['Satoshi', 'Inter', 'sans-serif'],
      },
      colors: {
        // Extended VisionBuilt palette (accessible as vb-* classes)
        'vb': {
          bg:      '#212529',
          bgalt:   '#2A2F35',
          surface: 'rgba(255, 255, 255, 0.04)',
          glass:   'rgba(255, 255, 255, 0.06)',
          border:  'rgba(255, 255, 255, 0.10)',
          text:    '#F8F9FA',
          text2:   '#DDE1E6',
          muted:   '#ADB5BD',
          accent:  '#AAB7C4',
        },
      },
      animation: {
        'pulse-slow':  'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x':  'gradient-x 4s ease infinite',
        'shine':       'shine 2.5s linear infinite',
        'float':       'float 7s ease-in-out infinite',
        'fade-up':     'fade-up 0.6s ease-out forwards',
        'fade-in':     'fade-in 0.6s ease-out forwards',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': 'left center' },
          '50%':      { 'background-position': 'right center' },
        },
        'shine': {
          '0%':   { 'background-position': '0% 0%' },
          '100%': { 'background-position': '-200% 0%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }
  },
  plugins: [
    heroui({
      themes: {
        // ── DARK THEME (only theme used) ──────────────────
        dark: {
          colors: {
            background:  '#212529',
            foreground:  '#F8F9FA',

            // Elevated surfaces (cards, inputs, code blocks)
            content1:    '#2A2F35',
            content2:    'rgba(255, 255, 255, 0.04)',
            content3:    'rgba(255, 255, 255, 0.06)',
            content4:    'rgba(255, 255, 255, 0.08)',

            // Primary action color = accent
            primary: {
              DEFAULT:    '#AAB7C4',
              foreground: '#F8F9FA',
              50:  '#F0F3F6',
              100: '#D5DDE3',
              200: '#B0BFCB',
              300: '#8AA0B2',
              400: '#AAB7C4',
              500: '#94A3B0',
              600: '#7E8F9C',
              700: '#687B88',
              800: '#526774',
              900: '#3C5360',
            },

            secondary: {
              DEFAULT:    '#343A40',
              foreground: '#CED4DA',
            },

            // Borders — very subtle
            divider:    '#252B30',
            focus:      '#7C8FA1',

            // Status colors
            success: {
              DEFAULT:    '#4caf50',
              foreground: '#ffffff',
            },
            warning: {
              DEFAULT:    '#ff9800',
              foreground: '#ffffff',
            },
            danger: {
              DEFAULT:    '#f44336',
              foreground: '#ffffff',
            },
          },
        },
      },
    })
  ],
}
