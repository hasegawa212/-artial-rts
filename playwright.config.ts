import { defineConfig, devices } from "@playwright/test";

const PORT = 3111;

// E2E は開発ログイン（AUTH_MODE=dev）+ メモリ保存で、外部に一切つながずに回す。
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      AUTH_MODE: "dev",
      SESSION_SECRET: "e2e-only-secret-e2e-only-secret-e2e-only",
      APP_URL: `http://localhost:${PORT}`,
      DATABASE_URL: "",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
