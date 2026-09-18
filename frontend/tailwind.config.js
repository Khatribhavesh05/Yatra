/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#0D9488",
        "primary-container": "#14B8A6",
        "on-primary": "#ffffff",
        "on-primary-container": "#f0fdfa",
        "inverse-primary": "#5EEAD4",
        "primary-fixed": "#99F6E4",
        "primary-fixed-dim": "#5EEAD4",
        "on-primary-fixed": "#042F2E",
        "on-primary-fixed-variant": "#115E59",

        "secondary": "#1E3A5F",
        "secondary-container": "#DBEAFE",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#1E40AF",
        "secondary-fixed": "#DBEAFE",
        "secondary-fixed-dim": "#93C5FD",
        "on-secondary-fixed": "#172554",
        "on-secondary-fixed-variant": "#1E3A5F",

        "tertiary": "#4c6059",
        "tertiary-container": "#657971",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#f5fff9",
        "tertiary-fixed": "#d2e7de",
        "tertiary-fixed-dim": "#b6cbc2",
        "on-tertiary-fixed": "#0c1f19",
        "on-tertiary-fixed-variant": "#384b44",

        "surface": "#f8f9fa",
        "surface-dim": "#d9dadb",
        "surface-bright": "#f8f9fa",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "surface-variant": "#e1e3e4",
        "surface-tint": "#0D9488",

        "on-surface": "#191c1d",
        "on-surface-variant": "#3f4941",
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2",

        "outline": "#6f7a70",
        "outline-variant": "#becabe",

        "background": "#f8f9fa",
        "on-background": "#191c1d",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        "DEFAULT": "0.25rem", // 4px
        "sm": "0.125rem",     // 2px
        "md": "0.375rem",     // 6px
        "lg": "0.5rem",       // 8px
        "xl": "0.75rem",      // 12px
        "2xl": "1rem",        // 16px
        "full": "9999px",
      },
      spacing: {
        "base": "8px",
        "gutter": "24px",
        "section-padding-desktop": "80px",
        "section-padding-mobile": "40px",
        "container-max-width": "1280px",
      },
      maxWidth: {
        "container-max-width": "1280px",
      },
      fontFamily: {
        "display-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "display-lg-mobile": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-md": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-sm": ["'Plus Jakarta Sans'", "sans-serif"],
        "body-lg": ["'Inter'", "sans-serif"],
        "body-md": ["'Inter'", "sans-serif"],
        "label-bold": ["'Work Sans'", "sans-serif"],
        "label-sm": ["'Work Sans'", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "800" }],
        "headline-md": ["36px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-sm": ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-bold": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "1.2", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};
