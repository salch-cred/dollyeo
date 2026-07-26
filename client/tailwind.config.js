/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dollyeo: {
          green: '#7df7c5',
          blue: '#79a8ff',
          red: '#ff6464',
          dark: '#0d1117',
          panel: 'rgba(255, 255, 255, 0.05)'
        }
      }
    },
  },
  plugins: [],
}
