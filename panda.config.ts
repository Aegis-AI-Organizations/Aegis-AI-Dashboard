import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          brand: {
            primary: { value: "{colors.cyan.400}" },
            secondary: { value: "{colors.purple.500}" },
            accent: { value: "{colors.cyan.500}" },
          },
          bg: {
            main: { value: "{colors.dark.900}" },
            card: { value: "{colors.dark.800}" },
            surface: { value: "#12151C" },
          },
          text: {
            main: { value: "#e5e7eb" },
            muted: { value: "#9ca3af" },
            bright: { value: "#ffffff" },
          },
        },
        spacing: {
          pagePadding: { value: "{spacing.8}" },
          cardPadding: { value: "{spacing.6}" },
          sectionGap: { value: "{spacing.10}" },
        },
      },
      tokens: {
        colors: {
          cyan: {
            400: { value: "#00f2ff" },
            500: { value: "#00d9e6" },
            900: { value: "#00484c" },
          },
          purple: {
            400: { value: "#8e33ff" },
            500: { value: "#7000ff" },
            600: { value: "#5700cc" },
          },
          dark: {
            900: { value: "#050810" },
            800: { value: "#0B0D13" },
          },
        },
        fonts: {
          sans: { value: '"Inter", ui-sans-serif, system-ui, sans-serif' },
          orbitron: {
            value: '"Orbitron", ui-sans-serif, system-ui, sans-serif',
          },
        },
        fontSizes: {
          title: { value: "2.5rem" },
          subtitle: { value: "1.25rem" },
          section: { value: "1.5rem" },
        },
      },
      recipes: {
        pageTitle: {
          className: "pageTitle",
          base: {
            fontFamily: "orbitron",
            fontSize: "title",
            fontWeight: "black",
            color: "brand.primary",
            letterSpacing: "tighter",
            mb: "4",
          },
        },
        card: {
          className: "card",
          base: {
            bg: "bg.card",
            borderRadius: "xl",
            p: "cardPadding",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // Enable JSX support
  jsxFramework: "react",
});
