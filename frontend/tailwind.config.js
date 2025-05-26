/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        bounce: "bounce 1.4s infinite ease-in-out both",
      },
    },
  },
  plugins: [],
}
