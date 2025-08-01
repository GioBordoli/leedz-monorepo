/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy colors (keep for compatibility)
        'translucent-green': 'rgba(0, 255, 127, 0.2)',
        'green-accent': 'rgba(0, 255, 127, 0.3)',
        'green-bright': '#10B981',
        
        // New design system colors
        'ink': '#0B0F14',
        'slate-custom': '#0F172A',
        'text-dark': '#0A0A0A',
        'text-light': '#F8FAFC',
        'mint': '#10B981',
        'mint-light': '#22D3EE',
        'border-light': '#E5E7EB',
        'border-dark': '#1F2937',
        'surface-light': '#F8FAFC',
        'surface-dark': '#1F2937',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'display': ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'mint-gradient': 'linear-gradient(90deg, #10B981 0%, #22D3EE 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        '20': '20px',
        '24': '24px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #10B981, 0 0 10px #10B981, 0 0 15px #10B981' },
          '100%': { boxShadow: '0 0 10px #10B981, 0 0 20px #10B981, 0 0 30px #10B981' },
        }
      }
    },
  },
  plugins: [],
} 