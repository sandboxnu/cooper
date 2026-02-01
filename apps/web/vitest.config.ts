import { defineConfig } from "vitest/config";
import path from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: [
      "test/**/*.{test,spec}.{ts,tsx}",
      "src/**/*.{test,spec}.{ts,tsx}",
    ],
    globals: true,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@cooper/ui/hooks/use-custom-toast": path.resolve(
        __dirname,
        "./test/stubs/use-custom-toast.ts",
      ),
      "node_modules/@cooper/ui/src/form": path.resolve(
        __dirname,
        "../../packages/ui/src/form.tsx",
      ),
      "node_modules/@cooper/ui/src/radio-group": path.resolve(
        __dirname,
        "../../packages/ui/src/radio-group.tsx",
      ),
      "node_modules/@cooper/ui/src/checkbox": path.resolve(
        __dirname,
        "../../packages/ui/src/checkbox.tsx",
      ),
      "node_modules/@cooper/ui/src/logo": path.resolve(
        __dirname,
        "../../packages/ui/src/logo.tsx",
      ),
      "node_modules/@cooper/ui/src/button": path.resolve(
        __dirname,
        "../../packages/ui/src/button.tsx",
      ),
      "node_modules/@cooper/ui/src/card": path.resolve(
        __dirname,
        "../../packages/ui/src/card.tsx",
      ),
    },
  },
});
