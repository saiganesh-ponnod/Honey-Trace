/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        honey: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        amberGold: {
          50: '#fbf9f1',
          100: '#f5f0db',
          200: '#ece0b5',
          300: '#e0ca86',
          400: '#d4b159',
          500: '#c59b3b',
          600: '#ab7f2e',
          700: '#896127',
          800: '#714e25',
          900: '#5f4223',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow-honey': '0 4px 20px -2px rgba(245, 158, 11, 0.25)',
        'glow-success': '0 4px 20px -2px rgba(16, 185, 129, 0.25)',
        'glow-danger': '0 4px 20px -2px rgba(244, 63, 94, 0.25)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 30px -5px rgba(180, 83, 9, 0.08), 0 4px 10px -3px rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
}
