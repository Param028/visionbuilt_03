
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
        // Cyber Monolith palette
        cyberBg: '#0D0E12',
        cyberCard: '#161820',
        cyberAccent: '#00FF66',
        cyberTextPrimary: '#FFFFFF',
        cyberTextSecondary: '#8F95A5',
        // Preserve existing vb palette
        'vb': {
          bg:      '#0D0E12', // background
          bgalt:   '#161820', // alternate/card background
          surface: 'rgba(255, 255, 255, 0.07)',
          glass:   'rgba(255, 255, 255, 0.09)',
          border:  'rgba(255, 255, 255, 0.14)',
          text:    '#FFFFFF', // primary text
          text2:   '#8F95A5', // secondary text
          muted:   'rgba(255, 255, 255, 0.58)',
          accent:  '#00FF66', // neon accent
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
            background:  '#08080A',
            foreground:  '#FFFFFF',

            // Elevated surfaces (cards, inputs, code blocks)
            content1:    'rgba(255, 255, 255, 0.09)',
            'content1-foreground': '#FFFFFF',
            content2:    '#0F0F11',
            'content2-foreground': 'rgba(255, 255, 255, 0.82)',
            content3:    '#17171C',
            'content3-foreground': 'rgba(255, 255, 255, 0.82)',
            content4:    'rgba(255, 255, 255, 0.06)',
            'content4-foreground': 'rgba(255, 255, 255, 0.58)',

            // Primary action color = accent
            primary: {
              DEFAULT:    '#B8C4D0',
              foreground: '#08080A',
              50:  '#F5F7F8',
              100: '#E5EAEF',
              200: '#D1DAE3',
              300: '#B8C4D0',
              400: '#9FAFC0',
              500: '#8295AB',
              600: '#677A91',
              700: '#4E5F72',
              800: '#364352',
              900: '#1F2833',
            },

            secondary: {
              DEFAULT:    'rgba(255, 255, 255, 0.10)',
              foreground: '#FFFFFF',
            },

            // Borders — white glass
            divider:    'rgba(255, 255, 255, 0.14)',
            focus:      '#B8C4D0',

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
            background:  '#08080A',
            foreground:  '#FFFFFF',

            // Elevated surfaces (cards, inputs, code blocks)
            content1:    'rgba(255, 255, 255, 0.09)',
            'content1-foreground': '#FFFFFF',
            content2:    '#0F0F11',
            'content2-foreground': 'rgba(255, 255, 255, 0.82)',
            content3:    '#17171C',
            'content3-foreground': 'rgba(255, 255, 255, 0.82)',
            content4:    'rgba(255, 255, 255, 0.06)',
            'content4-foreground': 'rgba(255, 255, 255, 0.58)',

            // Primary action color = accent
            primary: {
              DEFAULT:    '#B8C4D0',
              foreground: '#08080A',
              50:  '#F5F7F8',
              100: '#E5EAEF',
              200: '#D1DAE3',
              300: '#B8C4D0',
              400: '#9FAFC0',
              500: '#8295AB',
              600: '#677A91',
              700: '#4E5F72',
              800: '#364352',
              900: '#1F2833',
            },

            secondary: {
              DEFAULT:    'rgba(255, 255, 255, 0.10)',
              foreground: '#FFFFFF',
            },

            // Borders — white glass
            divider:    'rgba(255, 255, 255, 0.14)',
            focus:      '#B8C4D0',

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
