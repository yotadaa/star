/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        pixel: ["var(--font-pixel)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        ink: "var(--ink)",
        cream: "var(--cream)",
        parchment: "var(--parchment)",
        gold: "var(--gold)",
        aurora: "var(--aurora)",
        coral: "var(--coral)",
        moss: "var(--moss)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
