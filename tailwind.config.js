/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRITICAL: This 'content' array tells Tailwind where to look for class names.
  // It must point to your JSX files where the Tailwind classes are used.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
