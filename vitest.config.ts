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
        "**/packages/auth/src/**",
        "**/apps/web/src/trpc/**",
        "**/apps/auth-proxy/**",
        "**/apps/docs",
        "**/apps/web/src/middleware.ts",
        "**/packages/api/tests/mocks/**",
        "**/packages/ab/src/client.ts",
        "**/packages/api/src/index.ts",
        "**/packages/api/src/trpc.ts",
        "**/packages/db/src/client.ts"
      ],
    },
  },
});
