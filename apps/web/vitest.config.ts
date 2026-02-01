import { defineConfig } from "vitest/config";
import path from "node:path";
import react from "@vitejs/plugin-react"


export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}"],
    globals: true,
    exclude: [
          "**/packages/validators/**",
          "**/tooling/eslint/**",
          "**/tooling/prettier/**",
          "**/tooling/tailwind/**",
          "**/turbo/generators/**",
        ],
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
