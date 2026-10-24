/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0b1120',
        },
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}
