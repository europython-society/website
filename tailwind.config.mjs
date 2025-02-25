/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],

  theme: {
    colors: {
      black: "#000",
      white: "#fff",
      text: "var(--color-text)",
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",

      "text-inverted": "var(--color-text-inverted)",

      "body-inverted": "#001c13",
      "body-background": "var(--color-body-background)",
      "body-light": "#888",

      "hero-primary": "var(--color-hero-primary)",
      "hero-secondary": "var(--color-hero-secondary)",

      primary: "var(--color-primary)",
      "primary-hover": "var(--color-primary-hover)",
      "primary-active": "var(--color-primary-active)",
      button: "var(--color-button)",
      "button-hover": "var(--color-button-hover)",

      secondary: "var(--color-secondary)",
      "secondary-dark": "var(--color-secondary-dark)",
      "secondary-darkest": "var(--color-secondary-darkest)",
      "secondary-light": "var(--color-secondary-light)",

      "session-beginner": "#63d451",
      "session-intermediate": "#ffcd45",
      "session-advanced": "#d34848",
      "session-none": "var(--color-secondary-light)",

      "sponsor-keystone": "#5c9f92",
      "sponsor-diamond": "#568497",
      "sponsor-platinum": "#6b6c6e",
      "sponsor-gold": "#f5c251",
      "sponsor-silver": "#C0C0C0",
      "sponsor-bronze": "#6e6151",
      "sponsor-patron": "#a11217",

      red: "#ce3333",
      "keynoter-info": "hsla(0,0%,100%,.85)",
    },
    extend: {
      aspectRatio: {
        hero: "2.4380530973",
      },
      fontFamily: {
        system: ["system-ui", "sans-serif"],
        title: [
          "Inter Variable",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
        ],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.text"),
            "--tw-prose-headings": theme("colors.white"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
