
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
        sans:    ['Geist', 'Manrope', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', '"Clash Display"', 'Inter', 'sans-serif'],
        mono:    ['"Geist Mono"', 'monospace'],
        satoshi: ['Satoshi', 'Inter', 'sans-serif'],
      },
      colors: {
        // Charcoal and frosted glass palette
        cyberBg: '#1A1A1A',
        cyberCard: 'rgba(255, 255, 255, 0.08)',
        cyberAccent: '#D9D9D9',
        cyberTextPrimary: '#FFFFFF',
        cyberTextSecondary: '#D9D9D9',
        // Preserve existing vb palette
        'vb': {
          bg:      '#1A1A1A',
          bgalt:   '#1A1A1A',
          surface: 'rgba(255, 255, 255, 0.07)',
          glass:   'rgba(255, 255, 255, 0.08)',
          border:  'rgba(255, 255, 255, 0.10)',
          text:    '#FFFFFF',
          text2:   '#D9D9D9',
          muted:   'rgba(255, 255, 255, 0.58)',
          accent:  '#D9D9D9',
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
        light: {
          colors: {
            background:  '#1A1A1A',
            foreground:  '#FFFFFF',

            // Elevated surfaces (cards, inputs, code blocks)
            content1:    'rgba(255, 255, 255, 0.08)',
            'content1-foreground': '#FFFFFF',
            content2:    'rgba(255, 255, 255, 0.06)',
            'content2-foreground': '#D9D9D9',
            content3:    'rgba(255, 255, 255, 0.05)',
            'content3-foreground': '#D9D9D9',
            content4:    'rgba(255, 255, 255, 0.04)',
            'content4-foreground': 'rgba(217, 217, 217, 0.68)',

            primary: {
              DEFAULT:    '#D9D9D9',
              foreground: '#1A1A1A',
              50:  '#FFFFFF',
              100: '#F4F4F4',
              200: '#E8E8E8',
              300: '#D9D9D9',
              400: '#C7C7C7',
              500: '#AFAFAF',
              600: '#8F8F8F',
              700: '#6F6F6F',
              800: '#4A4A4A',
              900: '#2A2A2A',
            },

            secondary: {
              DEFAULT:    'rgba(255, 255, 255, 0.10)',
              foreground: '#FFFFFF',
            },

            // Borders — white glass
            divider:    'rgba(255, 255, 255, 0.10)',
            focus:      '#D9D9D9',

            // Status colors
            success: {
              DEFAULT:    '#2e7d32',
              foreground: '#ffffff',
            },
            warning: {
              DEFAULT:    '#ed6c02',
              foreground: '#ffffff',
            },
            danger: {
              DEFAULT:    '#d32f2f',
              foreground: '#ffffff',
            },
          },
        },
        dark: {
          colors: {
            background:  '#1A1A1A',
            foreground:  '#FFFFFF',

            // Elevated surfaces (cards, inputs, code blocks)
            content1:    'rgba(255, 255, 255, 0.08)',
            'content1-foreground': '#FFFFFF',
            content2:    'rgba(255, 255, 255, 0.06)',
            'content2-foreground': '#D9D9D9',
            content3:    'rgba(255, 255, 255, 0.05)',
            'content3-foreground': '#D9D9D9',
            content4:    'rgba(255, 255, 255, 0.04)',
            'content4-foreground': 'rgba(217, 217, 217, 0.68)',

            primary: {
              DEFAULT:    '#D9D9D9',
              foreground: '#1A1A1A',
              50:  '#FFFFFF',
              100: '#F4F4F4',
              200: '#E8E8E8',
              300: '#D9D9D9',
              400: '#C7C7C7',
              500: '#AFAFAF',
              600: '#8F8F8F',
              700: '#6F6F6F',
              800: '#4A4A4A',
              900: '#2A2A2A',
            },

            secondary: {
              DEFAULT:    'rgba(255, 255, 255, 0.10)',
              foreground: '#FFFFFF',
            },

            // Borders — white glass
            divider:    'rgba(255, 255, 255, 0.10)',
            focus:      '#D9D9D9',

            // Status colors
            success: {
              DEFAULT:    '#2e7d32',
              foreground: '#ffffff',
            },
            warning: {
              DEFAULT:    '#ed6c02',
              foreground: '#ffffff',
            },
            danger: {
              DEFAULT:    '#d32f2f',
              foreground: '#ffffff',
            },
          },
        },
      },
    })
  ],
}
