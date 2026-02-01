import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/packages/validators/**",
        "**/tooling/eslint/**",
        "**/tooling/prettier/**",
        "**/tooling/tailwind/**",
        "**/tooling/typescript/**",
        "**/tooling/github/**",
        "**/turbo/generators/**",
        "**/*.config.{js,ts,mjs,cjs}",
        "**/vitest.workspace.ts",
        "**/route.ts",
        "**/font.ts",
        "**/levels_company_names.ts",
        "**/levels_company_data.ts",
      ],
    },
  },
});
