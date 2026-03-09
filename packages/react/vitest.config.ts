import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    server: {
      deps: {
        // Inline the workspace core-sdk so vitest transforms it via esbuild
        // instead of loading its compiled dist as opaque external ESM (which
        // fails on extension-less relative imports in compiled TypeScript output).
        inline: ["@mycelium-ip/core-sdk"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**/*"],
    },
  },
});
