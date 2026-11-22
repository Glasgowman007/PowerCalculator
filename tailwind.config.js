/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#f6f7fb',
        volt: '#2563eb',
        amp: '#db2777',
        ohm: '#7c3aed',
        watt: '#d97706',
        energy: '#059669',
      },
    },
  },
  plugins: [],
}
