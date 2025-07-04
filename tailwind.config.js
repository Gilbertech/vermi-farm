/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e4',
          500: '#2d8e41',
          600: '#246b35',
          700: '#1d5429',
        },
        secondary: {
          50: '#fdf4f0',
          100: '#fae8e0',
          500: '#983F21',
          600: '#7a3219',
          700: '#5c2613',
        }
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};