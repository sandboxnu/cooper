import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // plugin-react transforms JSX/TSX with the automatic runtime regardless of
  // the app's `jsx: preserve` tsconfig, which oxc would otherwise leave as-is.
  plugins: [react()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
  },
});
