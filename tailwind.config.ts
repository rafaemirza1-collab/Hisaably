import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#070F22",
        "navy-800": "#0A1830",
        "navy-700": "#0E2142",
        "navy-panel": "#0B1A36",
        emerald: "#10B981",
        "emerald-deep": "#059669",
        gold: "#D4AF6A",
        "gold-soft": "#E8CE97",
        "gold-deep": "#B38D43",
        cream: "#F4EEDF",
      },
      fontFamily: {
        serif: ["'Libre Caslon Text'", 'Georgia', 'serif'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
        inter: ['var(--font-inter)', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'var(--font-inter)', 'sans-serif'],
      },
      transitionDuration: {
        '400': '400ms',
      },
      backgroundOpacity: {
        '4': '0.04',
        '8': '0.08',
      },
    },
  },
  plugins: [],
};
export default config;
