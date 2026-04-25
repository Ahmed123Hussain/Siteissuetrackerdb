/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'status-open': '#ef4444',
        'status-ongoing': '#f97316',
        'status-closed': '#22c55e',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-md': '0 4px 16px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
