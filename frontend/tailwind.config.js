/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'translucent-green': 'rgba(0, 255, 127, 0.2)',
        'green-accent': 'rgba(0, 255, 127, 0.3)',
        'green-bright': '#10B981',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
} 