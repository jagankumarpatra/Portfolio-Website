import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        line: "var(--line)",
        card: "var(--card)",
        card2: "var(--card2)",
        link: "var(--link)",
        accent: "var(--accent)",
        accent2: "var(--accent2)",
        brand: "var(--brand)",
        green: "var(--green)",
        purple: "var(--purple)",
        cyan: "var(--cyan)",
        signal: "var(--signal)",
      },
      maxWidth: { reading: "720px" },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-lg)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
