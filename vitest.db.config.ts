import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// PostgreSQL を使う結合テスト。DATABASE_URL が必要（README 参照）。
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["tests/db/**/*.test.ts"], environment: "node", fileParallelism: false },
});
