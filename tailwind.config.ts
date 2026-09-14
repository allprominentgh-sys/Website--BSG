/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],

  theme: {
    extend: {
      colors: {
        "prominent-blue": "#4169E1",
        "prominent-cyan": "#00FFFF",
        "prominent-sea": "#006994",
        "prominent-dark": "#071527"
      }
    }
  },

  plugins: []
};
