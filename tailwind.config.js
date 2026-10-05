/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.{js,ts,jsx,tsx}', '!./supabase/**', '!./node_modules/**'],
  theme: { extend: { fontFamily: { sans: ['Inter','system-ui','sans-serif'], display: ['VB Display','Inter','sans-serif'] } } },
  plugins: []
}
