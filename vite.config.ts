import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "styled-system": path.resolve(__dirname, "src/styled-system"),
    },
  },
  server: {
    host: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/types/**",
        "src/vite-env.d.ts",
        "src/styled-system/**",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
      },
    },
  },
});
