/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mainBlue: "#233438",
        mainYellow: "#F7FEBE",
        mainRed: "#F04642",
        accentBlue: "#1d2c2f",
        accentGray: "#374151",
        inputBlue: "#273a3f",
      },
    },
  },
  plugins: [],
};
