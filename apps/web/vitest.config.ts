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
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@cooper/ui/hooks/use-custom-toast": path.resolve(
        __dirname,
        "./test/stubs/use-custom-toast.ts",
      ),
    },
  },
});
