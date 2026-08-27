import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const resolveAlias = {
  "@": fileURLToPath(new URL("./", import.meta.url)),
  "server-only": fileURLToPath(
    new URL("./tests/stubs/server-only.ts", import.meta.url)
  ),
  // Auth.js imports "next/server" without ".js" — Node ESM under Vitest can't
  // resolve that; map to the concrete file.
  "next/server": fileURLToPath(
    new URL("./node_modules/next/server.js", import.meta.url)
  ),
};

const TEST_ENV_DEFAULTS = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://test:test@localhost:5432/nexora_test",
  DIRECT_URL: "postgresql://test:test@localhost:5432/nexora_test",
  AUTH_SECRET: "test-only-secret-that-is-long-enough-to-satisfy-zod",
  AUTH_URL: "http://localhost:3000",
  // Both OAuth pairs left unset by default → providers hidden; individual
  // tests can override by mutating process.env in beforeEach.
} as const;

export default defineConfig({
  resolve: {
    alias: resolveAlias,
  },
  test: {
    env: TEST_ENV_DEFAULTS,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        ".next/**",
        "coverage/**",
        "node_modules/**",
        "prisma/**",
        "tests/**",
        "**/__tests__/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.ui.test.tsx",
        "**/*.server.test.ts",
        "app/api/auth/**",
        "next.config.ts",
        "postcss.config.mjs",
        "eslint.config.mjs",
        "vitest.config.ts",
      ],
    },
    projects: [
      {
        resolve: { alias: resolveAlias },
        test: {
          name: "node",
          environment: "node",
          include: [
            "lib/**/*.test.ts",
            "services/**/*.test.ts",
            "services/**/__tests__/**/*.test.ts",
            "lib/**/__tests__/**/*.test.ts",
            "proxy.test.ts",
            "tests/env.test.ts",
            "tests/helpers/**/*.test.ts",
            "tests/bdd/**/*.test.ts",
            "**/*.server.test.ts",
          ],
          exclude: [
            "node_modules/**",
            ".next/**",
            "coverage/**",
            "**/*.ui.test.tsx",
            "**/*.test.tsx",
          ],
        },
      },
      {
        plugins: [react()],
        resolve: { alias: resolveAlias },
        test: {
          name: "jsdom",
          environment: "jsdom",
          globals: false,
          setupFiles: ["./tests/setup.ts"],
          include: [
            "components/**/*.test.tsx",
            "components/**/__tests__/**/*.test.tsx",
            "app/**/*.ui.test.tsx",
            "app/**/__tests__/**/*.ui.test.tsx",
            "**/*.ui.test.tsx",
          ],
          exclude: ["node_modules/**", ".next/**", "coverage/**"],
        },
      },
    ],
  },
});
