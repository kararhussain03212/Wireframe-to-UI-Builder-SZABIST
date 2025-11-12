/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        "1xl": "1360px",
        "1lg": "1150px",
        "2lg": "1080px",
        "1md": "880px",
        "1sm": "720px",
        "2sm": "565px",
        "3sm": "360px",
      },
    },
  },
  plugins: [],
};
