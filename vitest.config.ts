import {fileURLToPath} from "node:url";
import {defineConfig} from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "next/server": fileURLToPath(new URL("./node_modules/next/server.js", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    maxWorkers: 1,
    server: {deps: {inline: ["next-intl"]}},
    restoreMocks: true,
    globalSetup: ["./tests/support/globalSetup.ts"],
    hookTimeout: 30_000,
    testTimeout: 60_000,
  },
});
