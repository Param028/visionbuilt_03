
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./supabase/**",
    "!./node_modules/**"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
      colors: {
        palette: {
          900: '#0D0D0D',
          800: '#404040',
          500: '#808080',
          300: '#BFBFBF',
          50: '#FFFFFF',
        },
        vision: {
          900: '#0D0D0D',
          800: '#404040',
          primary: '#FFFFFF',
          secondary: '#BFBFBF',
          accent: '#808080',
          glass: 'rgba(64, 64, 64, 0.2)',
          glassBorder: 'rgba(191, 191, 191, 0.2)',
        }
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
  plugins: [],
}
