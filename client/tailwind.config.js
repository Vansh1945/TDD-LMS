/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
        extend: {
          colors: {
            primary: "#2563EB",
            secondary: "#3B82F6",
            success: "#16A34A",
            warning: "#FACC15",
            danger: "#DC2626",
            background: "#F3F4F6",
            text: "#111827",
          },
        },  },
  plugins: [],
}
