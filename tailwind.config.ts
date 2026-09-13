import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        "royal-blue": "#1557c0",
        "sky-blue": "#25a9e8",
        "dark-blue": "#0b1f44",
      },
    },
  },

  plugins: [],
};

export default config;
