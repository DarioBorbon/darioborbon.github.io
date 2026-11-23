import type { Config } from "tailwindcss";

/**
 * Design tokens. Colors are mirrored as CSS variables in app/globals.css
 * so the 3D scene, CSS and Tailwind all speak the same palette.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#050506", 900: "#08080a", 800: "#0e0e11", 700: "#16161a", 600: "#222228" },
        bone: { DEFAULT: "#f4efe9", muted: "#b9b2ab", dim: "#8c867f" },
        rose: { DEFAULT: "#ff3d8b", soft: "#ff8fb8", deep: "#b0165a", glow: "#ff5c9d" },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      letterSpacing: { label: "0.18em" },
    },
  },
  plugins: [],
};
export default config;
