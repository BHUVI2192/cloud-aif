import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-container": "var(--primary-container)",
        secondary: "var(--secondary)",
        "secondary-container": "var(--secondary-container)",
        tertiary: "var(--tertiary)",
        surface: "var(--surface)",
        "surface-container": "var(--surface-container)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        outline: "var(--outline)",
        "outline-variant": "var(--outline-variant)",
        
        // Backward-compatible color variables
        forest: "var(--primary)",
        brand: "var(--primary)",
        emerald: "var(--secondary)",
        sage: "var(--secondary-container)",
        mist: "var(--surface-container-low)",
        paper: "var(--surface)",
        ink: "var(--on-surface)",
        slate2: "var(--on-surface-variant)",
        line: "var(--outline-variant)",
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        kannada: ["Noto Sans Kannada", "Noto Sans", "system-ui", "sans-serif"],
        sans: ["Noto Sans", "Noto Sans Kannada", "Inter", "system-ui", "sans-serif"],
        display: ["Inter", "Noto Sans Kannada", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
