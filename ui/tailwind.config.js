/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00796B', // Teal green - reliability and smart city
        secondary: '#FFC107', // Amber yellow - attention & navigation highlight
        accent: '#263238', // Dark slate gray - text/icons
        cta: '#00BFA5', // Bright teal - CTA buttons
        background: '#F9FAFB', // Soft white-gray background
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundColor: {
        'soft': '#F9FAFB',
      },
    },
  },
  plugins: [],
}
