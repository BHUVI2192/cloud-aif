import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#14331F", brand: "#1F5235", emerald: "#2E7D53",
        sage: "#9CC9A9", mist: "#EAF3EC", paper: "#FBFCFA",
        ink: "#16201A", slate2: "#586259", line: "#E1E9E2",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
