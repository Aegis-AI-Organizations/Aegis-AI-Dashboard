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
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // Enable JSX support
  jsxFramework: "react",
});
