
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
          surface: 'rgba(255, 255, 255, 0.07)',
          glass:   'rgba(255, 255, 255, 0.09)',
          border:  'rgba(255, 255, 255, 0.14)',
          text:    '#FFFFFF',
          text2:   'rgba(255, 255, 255, 0.82)',
          muted:   'rgba(255, 255, 255, 0.58)',
          accent:  '#B8C4D0',
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
            background:  '#F8F9FA',
            foreground:  '#111418',

            // Elevated surfaces (cards, inputs, code blocks)
            content1:    'rgba(33, 37, 41, 0.72)',
            'content1-foreground': '#F8F9FA',
            content2:    'rgba(52, 58, 64, 0.68)',
            'content2-foreground': 'rgba(248, 249, 250, 0.78)',
            content3:    'rgba(73, 80, 87, 0.78)',
            'content3-foreground': '#F8F9FA',
            content4:    'rgba(33, 37, 41, 0.4)',
            'content4-foreground': 'rgba(248, 249, 250, 0.56)',

            // Primary action color = accent
            primary: {
              DEFAULT:    '#7C8FA1',
              foreground: '#FFFFFF',
              50:  '#F0F3F6',
              100: '#D5DDE3',
              200: '#B0BFCB',
              300: '#8AA0B2',
              400: '#7C8FA1',
              500: '#6E8090',
              600: '#5A6A78',
              700: '#465460',
              800: '#323D47',
              900: '#1E272F',
            },

            secondary: {
              DEFAULT:    'rgba(52, 58, 64, 0.68)',
              foreground: 'rgba(248, 249, 250, 0.78)',
            },

            // Borders — very subtle
            divider:    'rgba(255, 255, 255, 0.08)',
            focus:      '#7C8FA1',

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
            background:  '#F8F9FA',
            foreground:  '#111418',

            // Elevated surfaces (cards, inputs, code blocks)
            content1:    'rgba(33, 37, 41, 0.72)',
            'content1-foreground': '#F8F9FA',
            content2:    'rgba(52, 58, 64, 0.68)',
            'content2-foreground': 'rgba(248, 249, 250, 0.78)',
            content3:    'rgba(73, 80, 87, 0.78)',
            'content3-foreground': '#F8F9FA',
            content4:    'rgba(33, 37, 41, 0.4)',
            'content4-foreground': 'rgba(248, 249, 250, 0.56)',

            // Primary action color = accent
            primary: {
              DEFAULT:    '#7C8FA1',
              foreground: '#FFFFFF',
              50:  '#F0F3F6',
              100: '#D5DDE3',
              200: '#B0BFCB',
              300: '#8AA0B2',
              400: '#7C8FA1',
              500: '#6E8090',
              600: '#5A6A78',
              700: '#465460',
              800: '#323D47',
              900: '#1E272F',
            },

            secondary: {
              DEFAULT:    'rgba(52, 58, 64, 0.68)',
              foreground: 'rgba(248, 249, 250, 0.78)',
            },

            // Borders — very subtle
            divider:    'rgba(255, 255, 255, 0.08)',
            focus:      '#7C8FA1',

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
