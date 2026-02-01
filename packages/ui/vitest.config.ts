import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: "@cooper/ui/button",
        replacement: path.resolve(__dirname, "./src/button.tsx"),
      },
      {
        find: "@cooper/ui/dialog",
        replacement: path.resolve(__dirname, "./src/dialog.tsx"),
      },
      {
        find: "@cooper/ui/label",
        replacement: path.resolve(__dirname, "./src/label.tsx"),
      },
      {
        find: "@cooper/ui",
        replacement: path.resolve(__dirname, "./src/index.ts"),
      },
    ],
  },
});
