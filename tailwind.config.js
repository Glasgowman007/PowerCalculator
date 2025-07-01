/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: '#f8f5e6',
        black: '#181818',
        accentPurple: '#7c3aed',
        accentPink: '#f472b6',
        accentBlue: '#60a5fa',
      },
    },
  },
  plugins: [],
}
