/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06080a',
          900: '#0b0e11', // Deep background
          850: '#11151d',
          800: '#18202c', // Card background
          700: '#243042', // Elevated borders
          600: '#354458', // Hover border
          500: '#4c5f78',
        },
        accent: {
          emerald: '#0ecb81', // Trading Green (Bullish)
          rose: '#f6465d',    // Trading Red (Bearish)
          blue: '#3b82f6',    // Branding Blue
          gold: '#f0b90b',    // Warning/Gold Accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
