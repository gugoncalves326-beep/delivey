import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        panel: {
          bg: "var(--panel-bg)",
          "bg-secondary": "var(--panel-bg-secondary)",
          card: "var(--panel-card)",
          border: "var(--panel-border)",
        },
        brand: {
          purple: "var(--brand-purple)",
          "purple-secondary": "var(--brand-purple-secondary)",
          gold: "var(--brand-gold)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        status: {
          success: "var(--status-success)",
          error: "var(--status-error)",
          warning: "var(--status-warning)",
        },
        store: {
          bg: "var(--store-bg)",
          card: "var(--store-card)",
          accent: "var(--store-accent)",
          text: "var(--store-text)",
          "text-secondary": "var(--store-text-secondary)",
        },
      },
      borderRadius: {
        DEFAULT: "var(--radius-md)",
        sm: "var(--radius-sm)",
        lg: "var(--radius-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
