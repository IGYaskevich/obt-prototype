/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e6ff',
          500: '#2f6fed',
          600: '#2459c7',
        },
      },
    },
  },
  plugins: [],
}
