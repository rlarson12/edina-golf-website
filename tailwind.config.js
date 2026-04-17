/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'edina-forest':      '#0F3A25',
        'edina-green':       '#00A651',
        'edina-green-dark':  '#007A3D',
        'edina-green-light': '#E8F5EC',
        'edina-gold':        '#D4A437',
        'edina-gold-dark':   '#B8892A',
      },
      fontFamily: {
        heading: ['Barlow Condensed', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
