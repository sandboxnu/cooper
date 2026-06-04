import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run tests across every workspace package (migrated from
    // the deprecated vitest.workspace.ts into Vitest 4's `projects`).
    projects: ["packages/*", "apps/*", "tooling/*"],
    coverage: {
      provider: "v8",
      // `all` instruments every source file (not just imported ones)
      // so the percentages reflect overall coverage, not just tested files.
      all: true,
      reportsDirectory: "./coverage",
      reporter: ["text", "text-summary", "html", "json-summary"],
      include: ["packages/*/src/**", "apps/*/src/**", "tooling/*/src/**"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/*.config.*",
        "**/*.d.ts",
        "**/*.css",
        "**/env.ts",
        "**/middleware.ts",
        "**/__mocks__/**",
        "**/tests/**",
        "**/test/**",
        "packages/validators/src/index.ts",
        "packages/scraper/src/levels_company_data.ts",
        "packages/scraper/src/levels_company_names.ts",
        "packages/auth/src/auth.ts",
        "packages/auth/src/client.ts",
        "packages/auth/src/index.rsc.ts",
        "packages/auth/src/index.ts",
        "packages/db/src/client.ts",
        "packages/api/src/index.ts",
        "packages/api/src/root.ts",
        "packages/api/src/trpc.ts",
        "apps/web/src/trpc/**",
        "apps/web/src/app/styles/font.ts",
        "**/[(]dashboard[)]/layout.tsx",
        "**/redirection/page.tsx",
      ],
    },
  },
});
