import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pri: {
          DEFAULT: "#0E8C7F",
          hover: "#0B6F65",
          light: "#E6F5F2",
        },
        acc: {
          DEFAULT: "#FF7A59",
          hover: "#ec6544",
          light: "#FFF1EC",
        },
        ink: {
          DEFAULT: "#14213D",
          light: "#22335C",
        },
        mut: "#5B6475",
        line: "#E7E9EE",
        bg: "#FAFAF7",
        gold: "#F5B300",
        ok: "#16A34A",
        warn: "#D97706",
        bad: "#DC2626",
      },
      borderRadius: {
        card: "14px",
        panel: "18px",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

