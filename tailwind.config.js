/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'edina-green': '#00A651',
        'edina-green-dark': '#008542',
        'edina-green-light': '#00C95F',
        'edina-gold': '#FFD700',
        'edina-gold-dark': '#E6C200',
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
