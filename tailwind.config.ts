import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "var(--forest)",
        brand: "var(--brand)",
        emerald: "var(--emerald)",
        sage: "var(--sage)",
        mist: "var(--mist)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        slate2: "var(--slate)",
        line: "var(--line)",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
