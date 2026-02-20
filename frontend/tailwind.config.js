/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#004E89',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#FFD700',
          foreground: '#000000',
        },
      },
    },
  },
  plugins: [],
}