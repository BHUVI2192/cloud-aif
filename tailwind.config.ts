import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "on-primary": "var(--on-primary)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",
        "inverse-primary": "var(--inverse-primary)",
        secondary: "var(--secondary)",
        "on-secondary": "var(--on-secondary)",
        "secondary-container": "var(--secondary-container)",
        "on-secondary-container": "var(--on-secondary-container)",
        tertiary: "var(--tertiary)",
        "on-tertiary": "var(--on-tertiary)",
        "tertiary-container": "var(--tertiary-container)",
        "on-tertiary-container": "var(--on-tertiary-container)",
        "tertiary-fixed-variant": "var(--tertiary-fixed-variant)",
        surface: "var(--surface)",
        "surface-dim": "var(--surface-dim)",
        "surface-bright": "var(--surface-bright)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "inverse-surface": "var(--inverse-surface)",
        "inverse-on-surface": "var(--inverse-on-surface)",
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
        sm: "0.125rem", // 2px (badges)
        DEFAULT: "0.25rem", // 4px (buttons, inputs)
        md: "0.25rem", // 4px (fallback to inputs)
        lg: "0.5rem", // 8px (cards, containers)
        xl: "0.5rem", // 8px (align to 8px)
        "2xl": "0.5rem", // 8px (align to 8px)
        "3xl": "0.5rem", // 8px (align to 8px)
      },
    },
  },
  plugins: [],
};
export default config;
