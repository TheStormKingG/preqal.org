/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./tools/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      boxShadow: {
        'neu': '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
        'neu-sm': '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff',
        'neu-lg': '10px 10px 20px #a3b1c6, -10px -10px 20px #ffffff',
        'neu-inset': 'inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff',
        'neu-inset-sm': 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff',
      },
      colors: {
        'neu-bg': '#e0e5ec',
        'neu-dark': '#a3b1c6',
        'neu-light': '#ffffff',
      },
    },
  },
  plugins: [],
}
