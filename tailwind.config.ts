import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0e1756", 900: "#0a1145", 800: "#121c63" },
        brand: { DEFAULT: "#1f35b8", 600: "#1a2ea3", 50: "#eef1fd", 100: "#e1e6fb" },
        saffron: { DEFAULT: "#f28c0f", 600: "#de7d06", 50: "#fff4e5" },
        gold: "#fbbf24",
        ink: "#111a3d",
        muted: "#5b6283",
        line: "#e6e8f2",
        canvas: "#f4f5fa",
      },
      fontFamily: {
        sans: ["Poppins", "Hind", "ui-sans-serif", "system-ui", "sans-serif"],
        hindi: ["Hind", "Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,64,.04), 0 4px 16px rgba(16,24,64,.04)",
        lift: "0 10px 30px rgba(20,35,120,.12)",
      },
      borderRadius: { xl2: "18px" },
    },
  },
  plugins: [],
};
export default config;
