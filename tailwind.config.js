/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ── Design tokens ──────────────────────────────────────────────────────
      colors: {
        // Primary brand (blue)
        primary: {
          50:  "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        // Semantic — success
        success: {
          50:  "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        // Semantic — warning
        warning: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        // Semantic — danger
        danger: {
          50:  "#FFF1F2",
          100: "#FFE4E6",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
        // Sidebar
        sidebar: {
          bg:     "#0F172A",
          border: "rgba(255,255,255,0.06)",
          hover:  "rgba(255,255,255,0.08)",
        },
      },

      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'DM Mono'", "ui-monospace", "monospace"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      boxShadow: {
        card:   "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-md": "0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        "card-lg": "0 10px 30px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)",
        inner:  "inset 0 1px 2px rgba(0,0,0,0.06)",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },

      transitionTimingFunction: {
        "spring": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },

      animation: {
        "fade-in":  "fade-in 0.25s ease-out both",
        "slide-in": "slide-in 0.2s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
        shimmer:    "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};
