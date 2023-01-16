/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  content: [],
  theme: {
    fontFamily: {
      primary:
        "--inter-font, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI",
      secondary:
        "var(--poppins-font), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI",
    },
    extend: {},
  },
  plugins: [],
};
